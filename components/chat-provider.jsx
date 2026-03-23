"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { requestJson, requestSessionSnapshot } from "../lib/chat-api.js";
import { chatReducer, initialChatState } from "../lib/chat-state.js";
import {
  clearSessionCache,
  loadSessionCache,
  saveSessionCache,
} from "../lib/session-cache.js";
import { useHashRoute } from "../lib/use-hash-route.js";
import { useSessionStream } from "../lib/use-session-stream.js";
import { cx } from "../lib/cx.js";

const ChatContext = createContext(null);

function Toast({ message }) {
  return (
    <div
      className={cx(
        "pointer-events-none fixed left-1/2 top-4 z-[90] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-on-surface px-4 py-2 text-sm text-on-primary shadow-xl transition duration-200",
        message ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
      )}
    >
      {message || ""}
    </div>
  );
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const [toast, setToast] = useState("");

  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, 2400);
  }, []);

  const getCachedSessionId = useCallback(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return loadSessionCache(window.sessionStorage)?.sessionId ?? "";
  }, []);

  const persistSessionId = useCallback((sessionId) => {
    if (typeof window === "undefined") {
      return;
    }

    saveSessionCache(window.sessionStorage, { sessionId });
  }, []);

  const clearCachedSessionId = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    clearSessionCache(window.sessionStorage);
  }, []);

  const hasSession = Boolean(state.sessionId);
  const hasActiveChat = Boolean(state.activeChat);
  const { activeView, navigateTo } = useHashRoute({
    hasSession,
    hasActiveChat,
  });

  const onSessionInvalidated = useCallback(
    (message, nextRoute = "entry") => {
      clearCachedSessionId();
      dispatch({ type: "session-reset" });

      if (message) {
        showToast(message);
      }

      if (nextRoute) {
        navigateTo(nextRoute, { replace: true });
      }
    },
    [clearCachedSessionId, navigateTo, showToast],
  );

  const { clearReconnectTimer, closeStream } = useSessionStream({
    sessionId: state.sessionId,
    dispatch,
    navigateTo,
    onSessionInvalidated,
    showToast,
  });

  const resetSession = useCallback(
    (message, nextRoute = "entry") => {
      clearReconnectTimer();
      closeStream();
      onSessionInvalidated(message, nextRoute);
    },
    [clearReconnectTimer, closeStream, onSessionInvalidated],
  );

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const disconnectSession = useCallback(
    async ({ navigateTo: nextRoute = "entry", silent = false } = {}) => {
      const sessionId = state.sessionId;
      clearCachedSessionId();

      if (!sessionId) {
        if (nextRoute) {
          navigateTo(nextRoute, { replace: true });
        }
        return;
      }

      try {
        await requestJson("/api/session/disconnect", { sessionId });
      } catch {
        // The session may already be gone on the server.
      }

      clearReconnectTimer();
      closeStream();
      dispatch({ type: "session-reset" });

      if (!silent) {
        showToast("匿名身份已销毁。");
      }

      if (nextRoute) {
        navigateTo(nextRoute, { replace: true });
      }
    },
    [
      clearCachedSessionId,
      clearReconnectTimer,
      closeStream,
      navigateTo,
      showToast,
      state.sessionId,
    ],
  );

  const sendAction = useCallback(
    async (action) => {
      if (!state.sessionId) {
        throw new Error("当前没有有效会话。");
      }

      await requestJson("/api/actions", {
        sessionId: state.sessionId,
        action,
      });
    },
    [state.sessionId],
  );

  const createSession = useCallback(
    async (profile) => {
      if (state.sessionId) {
        await disconnectSession({ navigateTo: null, silent: true });
      }

      const nextSession = await requestJson("/api/session", { profile });

      persistSessionId(nextSession.sessionId);
      dispatch({ type: "session-created", payload: nextSession });
      showToast("匿名身份已建立。");
      navigateTo("discover", { replace: true });

      return nextSession;
    },
    [
      disconnectSession,
      navigateTo,
      persistSessionId,
      showToast,
      state.sessionId,
    ],
  );

  const restoreSession = useCallback(
    async (sessionId = getCachedSessionId()) => {
      const nextSessionId = `${sessionId ?? ""}`.trim();

      if (!nextSessionId) {
        throw new Error("当前没有可恢复的会话。");
      }

      if (state.sessionId && state.sessionId !== nextSessionId) {
        await disconnectSession({ navigateTo: null, silent: true });
      }

      const restoredSession = await requestSessionSnapshot(nextSessionId);

      persistSessionId(restoredSession.sessionId);
      dispatch({ type: "session-created", payload: restoredSession });

      return restoredSession;
    },
    [disconnectSession, getCachedSessionId, persistSessionId, state.sessionId],
  );

  const contextValue = useMemo(
    () => ({
      sessionId: state.sessionId,
      self: state.self,
      peers: state.peers,
      activeChat: state.activeChat,
      connectionState: state.connectionState,
      hasSession,
      hasActiveChat,
      activeView,
      navigateTo,
      showToast,
      createSession,
      restoreSession,
      async startChat(peerId) {
        try {
          await sendAction({ type: "start-chat", peerId });
        } catch (error) {
          showToast(error.message);
        }
      },
      async leaveChat() {
        try {
          await sendAction({ type: "leave-chat" });
        } catch (error) {
          showToast(error.message);
        }
      },
      async setTyping(isTyping) {
        try {
          await sendAction({ type: "typing", isTyping });
        } catch {
          // Ignore transient typing failures.
        }
      },
      async sendMessage(text) {
        const nextText = `${text}`.trim();

        if (!nextText || !state.activeChat) {
          return false;
        }

        dispatch({
          type: "self-message",
          message: {
            id: crypto.randomUUID(),
            kind: "self",
            text: nextText,
            sentAt: new Date().toISOString(),
          },
        });

        try {
          await sendAction({ type: "typing", isTyping: false });
          await sendAction({ type: "message", text: nextText });
          return true;
        } catch (error) {
          showToast(error.message);
          return false;
        }
      },
      disconnectSession,
      resetSession,
    }),
    [
      activeView,
      createSession,
      disconnectSession,
      resetSession,
      restoreSession,
      sendAction,
      showToast,
      hasActiveChat,
      hasSession,
      state.activeChat,
      state.connectionState,
      state.peers,
      state.self,
      state.sessionId,
      navigateTo,
    ],
  );

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
      <Toast message={toast} />
    </ChatContext.Provider>
  );
}

export function useChat() {
  const value = useContext(ChatContext);

  if (!value) {
    throw new Error("useChat must be used within ChatProvider.");
  }

  return value;
}

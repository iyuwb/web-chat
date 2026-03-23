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

import {
  getHashHref,
  parseHashRoute,
  resolveHashRoute,
} from "../lib/hash-route.js";
import {
  clearSessionCache,
  loadSessionCache,
  saveSessionCache,
} from "../lib/session-cache.js";
import { cx } from "../lib/cx.js";

const ChatContext = createContext(null);

const initialState = {
  sessionId: "",
  self: null,
  peers: [],
  activeChat: null,
  connectionState: "idle",
};

function reducer(state, action) {
  switch (action.type) {
    case "session-created":
      return {
        ...state,
        sessionId: action.payload.sessionId,
        self: action.payload.self,
        peers: action.payload.peers,
        activeChat: null,
        connectionState: "connecting",
      };

    case "connection-state":
      return {
        ...state,
        connectionState: action.value,
      };

    case "presence":
      return {
        ...state,
        peers: action.peers,
      };

    case "chat-started":
      return {
        ...state,
        activeChat: {
          roomId: action.payload.roomId,
          peer: action.payload.peer,
          startedAt: action.payload.startedAt,
          peerTyping: false,
          messages: [],
        },
      };

    case "self-message":
      if (!state.activeChat) {
        return state;
      }

      return {
        ...state,
        activeChat: {
          ...state.activeChat,
          peerTyping: false,
          messages: [...state.activeChat.messages, action.message],
        },
      };

    case "peer-message":
      if (
        !state.activeChat ||
        state.activeChat.roomId !== action.payload.roomId
      ) {
        return state;
      }

      return {
        ...state,
        activeChat: {
          ...state.activeChat,
          peerTyping: false,
          messages: [...state.activeChat.messages, action.payload.message],
        },
      };

    case "peer-typing":
      if (
        !state.activeChat ||
        state.activeChat.roomId !== action.payload.roomId
      ) {
        return state;
      }

      return {
        ...state,
        activeChat: {
          ...state.activeChat,
          peerTyping: action.payload.isTyping,
        },
      };

    case "chat-ended":
      return {
        ...state,
        activeChat: null,
      };

    case "session-reset":
      return initialState;

    default:
      return state;
  }
}

async function requestJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "请求失败。");
  }

  return data;
}

async function requestSessionSnapshot(sessionId) {
  const response = await fetch(
    `/api/session?sessionId=${encodeURIComponent(sessionId)}`,
    {
      cache: "no-store",
    },
  );
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "请求失败。");
  }

  return data;
}

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
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hashRoute, setHashRoute] = useState("entry");
  const [toast, setToast] = useState("");

  const eventSourceRef = useRef(null);
  const toastTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const writeHashUrl = useCallback((nextRoute, { replace = false } = {}) => {
    const normalizedRoute = parseHashRoute(getHashHref(nextRoute));

    if (typeof window === "undefined") {
      return;
    }

    const nextUrl = `${window.location.pathname}${window.location.search}${getHashHref(normalizedRoute)}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (currentUrl === nextUrl) {
      return;
    }

    window.history[replace ? "replaceState" : "pushState"](null, "", nextUrl);
  }, []);

  const updateHashRoute = useCallback(
    (nextRoute, { replace = false } = {}) => {
      const normalizedRoute = parseHashRoute(getHashHref(nextRoute));
      setHashRoute(normalizedRoute);
      writeHashUrl(normalizedRoute, { replace });
    },
    [writeHashUrl],
  );

  const showToast = useCallback((message) => {
    window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, 2400);
  }, []);

  const clearReconnectTimer = useCallback(() => {
    window.clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
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

  const closeStream = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleHashChange = () => {
      setHashRoute(parseHashRoute(window.location.hash));
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const activeView = resolveHashRoute(hashRoute, {
    hasSession: Boolean(state.sessionId),
    hasActiveChat: Boolean(state.activeChat),
  });

  const resetSession = useCallback(
    (message, nextRoute = "entry") => {
      clearReconnectTimer();
      closeStream();
      clearCachedSessionId();
      dispatch({ type: "session-reset" });

      if (message) {
        showToast(message);
      }

      if (nextRoute) {
        updateHashRoute(nextRoute, { replace: true });
      }
    },
    [
      clearCachedSessionId,
      clearReconnectTimer,
      closeStream,
      showToast,
      updateHashRoute,
    ],
  );

  const handleServerEvent = useCallback(
    (payload) => {
      clearReconnectTimer();
      dispatch({ type: "connection-state", value: "connected" });

      switch (payload.type) {
        case "session-ready":
          return;

        case "presence":
          dispatch({ type: "presence", peers: payload.peers });
          return;

        case "chat-started":
          dispatch({ type: "chat-started", payload });
          updateHashRoute("chat");
          return;

        case "message":
          dispatch({
            type: "peer-message",
            payload: {
              roomId: payload.roomId,
              message: {
                id: payload.message.id,
                kind: "peer",
                text: payload.message.text,
                sentAt: payload.message.sentAt,
              },
            },
          });
          return;

        case "typing":
          dispatch({
            type: "peer-typing",
            payload: {
              roomId: payload.roomId,
              isTyping: payload.isTyping,
            },
          });
          return;

        case "chat-ended":
          dispatch({ type: "chat-ended" });
          updateHashRoute("discover", { replace: true });
          showToast(
            payload.reason === "partner-disconnected"
              ? "对方已离线，当前对话已释放。"
              : "当前对话已销毁。",
          );
          return;

        default:
          return;
      }
    },
    [clearReconnectTimer, showToast, updateHashRoute],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.hash === getHashHref(activeView)) {
      return;
    }

    writeHashUrl(activeView, { replace: true });
  }, [activeView, writeHashUrl]);

  useEffect(() => {
    if (!state.sessionId) {
      return undefined;
    }

    dispatch({ type: "connection-state", value: "connecting" });

    const source = new EventSource(
      `/api/events?sessionId=${encodeURIComponent(state.sessionId)}`,
    );

    eventSourceRef.current = source;

    source.onopen = () => {
      clearReconnectTimer();
      dispatch({ type: "connection-state", value: "connected" });
    };

    source.onmessage = (event) => {
      try {
        handleServerEvent(JSON.parse(event.data));
      } catch {
        showToast("实时事件解析失败。");
      }
    };

    source.onerror = () => {
      dispatch({ type: "connection-state", value: "reconnecting" });

      if (!reconnectTimerRef.current) {
        reconnectTimerRef.current = window.setTimeout(() => {
          resetSession("连接已断开，临时会话已清空。");
        }, 6_500);
      }
    };

    return () => {
      if (eventSourceRef.current === source) {
        source.close();
        eventSourceRef.current = null;
      }
    };
  }, [
    clearReconnectTimer,
    handleServerEvent,
    resetSession,
    showToast,
    state.sessionId,
  ]);

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimerRef.current);
      window.clearTimeout(reconnectTimerRef.current);
      eventSourceRef.current?.close();
    };
  }, []);

  const disconnectSession = useCallback(
    async ({ navigateTo = "entry", silent = false } = {}) => {
      const sessionId = state.sessionId;
      clearCachedSessionId();

      if (!sessionId) {
        if (navigateTo) {
          updateHashRoute(navigateTo, { replace: true });
        }
        return;
      }

      try {
        await requestJson("/api/session/disconnect", { sessionId });
      } catch {
        // The session may already be gone on the server.
      }

      dispatch({ type: "session-reset" });
      clearReconnectTimer();
      closeStream();

      if (!silent) {
        showToast("匿名身份已销毁。");
      }

      if (navigateTo) {
        updateHashRoute(navigateTo, { replace: true });
      }
    },
    [
      clearCachedSessionId,
      clearReconnectTimer,
      closeStream,
      showToast,
      state.sessionId,
      updateHashRoute,
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
      updateHashRoute("discover", { replace: true });

      return nextSession;
    },
    [
      disconnectSession,
      persistSessionId,
      showToast,
      state.sessionId,
      updateHashRoute,
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
      hasSession: Boolean(state.sessionId),
      hasActiveChat: Boolean(state.activeChat),
      activeView,
      navigateTo: updateHashRoute,
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
      state.activeChat,
      state.connectionState,
      state.peers,
      state.self,
      state.sessionId,
      updateHashRoute,
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

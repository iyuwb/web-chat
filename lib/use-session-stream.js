import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
} from "react";

export function useSessionStream({
  sessionId,
  dispatch,
  navigateTo,
  onSessionInvalidated,
  showToast,
}) {
  const eventSourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const clearReconnectTimer = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
  }, []);

  const closeStream = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  const handleReconnectTimeout = useEffectEvent(() => {
    closeStream();
    clearReconnectTimer();
    onSessionInvalidated("连接已断开，临时会话已清空。");
  });

  const handleParseError = useEffectEvent(() => {
    showToast("实时事件解析失败。");
  });

  const handleServerEvent = useEffectEvent((payload) => {
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
        navigateTo("chat");
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
        navigateTo("discover", { replace: true });
        showToast(
          payload.reason === "partner-disconnected"
            ? "对方已离线，当前对话已释放。"
            : "当前对话已销毁。",
        );
        return;

      default:
        return;
    }
  });

  useEffect(() => {
    if (!sessionId) {
      clearReconnectTimer();
      closeStream();
      return undefined;
    }

    dispatch({ type: "connection-state", value: "connecting" });

    const source = new EventSource(
      `/api/events?sessionId=${encodeURIComponent(sessionId)}`,
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
        handleParseError();
      }
    };

    source.onerror = () => {
      dispatch({ type: "connection-state", value: "reconnecting" });

      if (reconnectTimerRef.current) {
        return;
      }

      reconnectTimerRef.current = window.setTimeout(() => {
        handleReconnectTimeout();
      }, 6_500);
    };

    return () => {
      if (eventSourceRef.current === source) {
        source.close();
        eventSourceRef.current = null;
      }
    };
  }, [clearReconnectTimer, closeStream, dispatch, sessionId]);

  useEffect(() => {
    return () => {
      clearReconnectTimer();
      closeStream();
    };
  }, [clearReconnectTimer, closeStream]);

  return {
    clearReconnectTimer,
    closeStream,
  };
}

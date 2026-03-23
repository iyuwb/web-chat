import { randomUUID } from "node:crypto";

import { createRelayHub } from "./relay-hub.js";

export function createSessionBroker({
  hub = createRelayHub(),
  createSessionId = () => randomUUID(),
  reconnectGraceMs = 4_000,
  scheduleTask = (callback, delay) => setTimeout(callback, delay),
  cancelTask = (taskId) => clearTimeout(taskId),
} = {}) {
  const subscribers = new Map();
  const queuedEvents = new Map();
  const pendingDisconnects = new Map();

  function getListeners(sessionId) {
    const listeners = subscribers.get(sessionId);
    return listeners?.size ? listeners : null;
  }

  function queueEvent(sessionId, event) {
    if (!queuedEvents.has(sessionId)) {
      queuedEvents.set(sessionId, []);
    }

    queuedEvents.get(sessionId).push(event);
  }

  function deliver(sessionId, event) {
    try {
      hub.getClient(sessionId);
    } catch {
      return;
    }

    const listeners = getListeners(sessionId);

    if (!listeners) {
      queueEvent(sessionId, event);
      return;
    }

    for (const listener of listeners) {
      listener(event);
    }
  }

  function dispatch(events) {
    for (const event of events) {
      deliver(event.targetClientId, event);
    }
  }

  function broadcastPresence() {
    for (const client of hub.getState().clients) {
      deliver(client.id, {
        type: "presence",
        peers: hub.getAvailablePeers(client.id),
      });
    }
  }

  function cancelPendingDisconnect(sessionId) {
    const taskId = pendingDisconnects.get(sessionId);

    if (!taskId) {
      return;
    }

    cancelTask(taskId);
    pendingDisconnects.delete(sessionId);
  }

  function finalizeDisconnect(sessionId) {
    cancelPendingDisconnect(sessionId);
    subscribers.delete(sessionId);
    queuedEvents.delete(sessionId);
    dispatch(hub.disconnectClient(sessionId));
    broadcastPresence();
  }

  return {
    createSession(profile) {
      const sessionId = createSessionId();
      const self = hub.registerClient(sessionId, profile);

      broadcastPresence();

      return {
        sessionId,
        self,
        peers: hub.getAvailablePeers(sessionId),
      };
    },

    getSession(sessionId) {
      return hub.getClient(sessionId);
    },

    restoreSession(sessionId) {
      hub.getClient(sessionId);

      return {
        sessionId,
        self: hub.getClient(sessionId),
        peers: hub.getAvailablePeers(sessionId),
      };
    },

    subscribe(sessionId, listener) {
      hub.getClient(sessionId);
      cancelPendingDisconnect(sessionId);

      if (!subscribers.has(sessionId)) {
        subscribers.set(sessionId, new Set());
      }

      const listeners = subscribers.get(sessionId);
      listeners.add(listener);

      const pending = queuedEvents.get(sessionId) ?? [];
      queuedEvents.set(sessionId, []);

      for (const event of pending) {
        listener(event);
      }

      return () => {
        const currentListeners = subscribers.get(sessionId);

        if (!currentListeners) {
          return;
        }

        currentListeners.delete(listener);

        if (currentListeners.size > 0) {
          return;
        }

        subscribers.delete(sessionId);
        cancelPendingDisconnect(sessionId);

        const taskId = scheduleTask(() => {
          finalizeDisconnect(sessionId);
        }, reconnectGraceMs);

        pendingDisconnects.set(sessionId, taskId);
      };
    },

    dispatchAction(sessionId, action) {
      switch (action.type) {
        case "start-chat":
          dispatch(hub.startConversation(sessionId, action.peerId).events);
          broadcastPresence();
          return;

        case "message":
          dispatch(hub.relayMessage(sessionId, action.text));
          return;

        case "typing":
          dispatch(hub.relayTyping(sessionId, action.isTyping));
          return;

        case "leave-chat":
          dispatch(hub.leaveConversation(sessionId));
          broadcastPresence();
          return;

        default:
          throw new Error("Unsupported action type.");
      }
    },

    disconnectSession(sessionId) {
      finalizeDisconnect(sessionId);
    },
  };
}

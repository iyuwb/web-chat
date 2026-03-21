function createPresencePayload(hub, clientId) {
  return {
    type: "presence",
    peers: hub.getAvailablePeers(clientId)
  };
}

export function createSocketController({
  hub,
  sendToClient,
  getConnectedClientIds
}) {
  function broadcastPresence() {
    for (const clientId of getConnectedClientIds()) {
      try {
        sendToClient(clientId, createPresencePayload(hub, clientId));
      } catch {
        // Ignore clients that are connected at the transport layer but not registered yet.
      }
    }
  }

  function dispatch(events) {
    for (const event of events) {
      sendToClient(event.targetClientId, event);
    }
  }

  function onMessage(clientId, payload) {
    switch (payload.type) {
      case "register": {
        sendToClient(clientId, {
          type: "registered",
          self: hub.registerClient(clientId, payload.profile)
        });
        broadcastPresence();
        return;
      }

      case "start-chat":
        dispatch(hub.startConversation(clientId, payload.peerId).events);
        broadcastPresence();
        return;

      case "message":
        dispatch(hub.relayMessage(clientId, payload.text));
        return;

      case "typing":
        dispatch(hub.relayTyping(clientId, payload.isTyping));
        return;

      case "leave-chat":
        dispatch(hub.leaveConversation(clientId));
        broadcastPresence();
        return;

      default:
        throw new Error("Unsupported event type.");
    }
  }

  function onDisconnect(clientId) {
    dispatch(hub.disconnectClient(clientId));
    broadcastPresence();
  }

  return { onMessage, onDisconnect };
}

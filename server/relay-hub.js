import { randomUUID } from "node:crypto";

function createHubError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeProfile(profile = {}) {
  const codename = `${profile.codename ?? ""}`.trim() || "匿名访客";
  const mood = `${profile.mood ?? ""}`.trim() || "calm";

  return { codename, mood };
}

function toClientSummary(client) {
  return {
    id: client.id,
    codename: client.profile.codename,
    mood: client.profile.mood,
    status: client.status,
    connectedAt: client.connectedAt.toISOString()
  };
}

function toRoomSnapshot(room) {
  return {
    id: room.id,
    members: [...room.members],
    createdAt: room.createdAt.toISOString()
  };
}

export function createRelayHub({
  now = () => new Date(),
  createRoomId = () => randomUUID(),
  createMessageId = () => randomUUID()
} = {}) {
  const clients = new Map();
  const rooms = new Map();

  function requireClient(clientId) {
    const client = clients.get(clientId);

    if (!client) {
      throw createHubError("CLIENT_NOT_FOUND", "Client session does not exist.");
    }

    return client;
  }

  function getPartner(room, clientId) {
    const partnerId = room.members.find((memberId) => memberId !== clientId);
    return partnerId ? clients.get(partnerId) ?? null : null;
  }

  function releaseRoom(roomId, { excludeClientIds = [], reason = "chat-ended" } = {}) {
    const room = rooms.get(roomId);

    if (!room) {
      return [];
    }

    rooms.delete(roomId);

    const events = [];

    for (const memberId of room.members) {
      const client = clients.get(memberId);

      if (!client) {
        continue;
      }

      client.status = "available";
      client.roomId = null;

      if (!excludeClientIds.includes(memberId)) {
        events.push({
          type: "chat-ended",
          targetClientId: memberId,
          reason
        });
      }
    }

    return events;
  }

  return {
    registerClient(clientId, profile) {
      const normalizedProfile = normalizeProfile(profile);
      const existingClient = clients.get(clientId);

      if (existingClient) {
        existingClient.profile = normalizedProfile;
        return toClientSummary(existingClient);
      }

      const client = {
        id: clientId,
        profile: normalizedProfile,
        status: "available",
        roomId: null,
        connectedAt: now()
      };

      clients.set(clientId, client);

      return toClientSummary(client);
    },

    getClient(clientId) {
      return toClientSummary(requireClient(clientId));
    },

    getAvailablePeers(forClientId) {
      return [...clients.values()]
        .filter((client) => client.id !== forClientId && client.status === "available")
        .map((client) => toClientSummary(client));
    },

    startConversation(requesterId, partnerId) {
      if (requesterId === partnerId) {
        throw createHubError("INVALID_PARTNER", "A client cannot start a conversation with itself.");
      }

      const requester = requireClient(requesterId);
      const partner = requireClient(partnerId);

      if (requester.status !== "available" || partner.status !== "available") {
        throw createHubError("PARTNER_UNAVAILABLE", "One of the clients is not available.");
      }

      const roomId = createRoomId();
      const createdAt = now();

      // Rooms keep only member routing data. Message content is never stored here.
      rooms.set(roomId, {
        id: roomId,
        members: [requesterId, partnerId],
        createdAt
      });

      requester.status = "chatting";
      requester.roomId = roomId;
      partner.status = "chatting";
      partner.roomId = roomId;

      return {
        roomId,
        events: [
          {
            type: "chat-started",
            targetClientId: requesterId,
            roomId,
            peer: toClientSummary(partner),
            startedAt: createdAt.toISOString()
          },
          {
            type: "chat-started",
            targetClientId: partnerId,
            roomId,
            peer: toClientSummary(requester),
            startedAt: createdAt.toISOString()
          }
        ]
      };
    },

    relayMessage(senderId, rawText) {
      const sender = requireClient(senderId);

      if (!sender.roomId) {
        return [];
      }

      const text = `${rawText ?? ""}`.trim();

      if (!text) {
        return [];
      }

      const room = rooms.get(sender.roomId);

      if (!room) {
        sender.status = "available";
        sender.roomId = null;
        return [];
      }

      const partner = getPartner(room, senderId);

      if (!partner) {
        return [];
      }

      return [
        {
          type: "message",
          targetClientId: partner.id,
          roomId: room.id,
          message: {
            id: createMessageId(),
            senderId,
            text,
            sentAt: now().toISOString()
          }
        }
      ];
    },

    relayTyping(senderId, isTyping) {
      const sender = clients.get(senderId);

      if (!sender?.roomId) {
        return [];
      }

      const room = rooms.get(sender.roomId);

      if (!room) {
        sender.status = "available";
        sender.roomId = null;
        return [];
      }

      const partner = getPartner(room, senderId);

      if (!partner) {
        return [];
      }

      return [
        {
          type: "typing",
          targetClientId: partner.id,
          roomId: room.id,
          isTyping: Boolean(isTyping)
        }
      ];
    },

    leaveConversation(clientId) {
      const client = requireClient(clientId);

      if (!client.roomId) {
        return [];
      }

      return releaseRoom(client.roomId, { reason: "chat-ended" });
    },

    disconnectClient(clientId) {
      const client = clients.get(clientId);

      if (!client) {
        return [];
      }

      const events = client.roomId
        ? releaseRoom(client.roomId, {
            excludeClientIds: [clientId],
            reason: "partner-disconnected"
          })
        : [];

      clients.delete(clientId);

      return events;
    },

    getState() {
      return {
        clients: [...clients.values()].map((client) => ({
          ...toClientSummary(client),
          roomId: client.roomId
        })),
        rooms: [...rooms.values()].map((room) => toRoomSnapshot(room))
      };
    }
  };
}

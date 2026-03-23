import assert from "node:assert/strict";
import test from "node:test";

test("chatReducer creates a connecting session snapshot", async () => {
  const { chatReducer, initialChatState } = await import("../lib/chat-state.js");

  const nextState = chatReducer(initialChatState, {
    type: "session-created",
    payload: {
      sessionId: "session-1",
      self: { id: "session-1", codename: "雾岛" },
      peers: [{ id: "session-2", codename: "余烬" }],
    },
  });

  assert.deepEqual(nextState, {
    sessionId: "session-1",
    self: { id: "session-1", codename: "雾岛" },
    peers: [{ id: "session-2", codename: "余烬" }],
    activeChat: null,
    connectionState: "connecting",
  });
});

test("chatReducer ignores peer events for another room", async () => {
  const { chatReducer, initialChatState } = await import("../lib/chat-state.js");

  const nextState = chatReducer(
    {
      ...initialChatState,
      activeChat: {
        roomId: "room-1",
        peer: { id: "session-2" },
        startedAt: "2026-03-23T00:00:00.000Z",
        peerTyping: false,
        messages: [],
      },
    },
    {
      type: "peer-message",
      payload: {
        roomId: "room-2",
        message: {
          id: "message-1",
          kind: "peer",
          text: "hello",
          sentAt: "2026-03-23T00:00:00.000Z",
        },
      },
    },
  );

  assert.equal(nextState.activeChat.messages.length, 0);
});

test("chatReducer resets the session state", async () => {
  const { chatReducer, initialChatState } = await import("../lib/chat-state.js");

  const nextState = chatReducer(
    {
      sessionId: "session-1",
      self: { id: "session-1" },
      peers: [{ id: "session-2" }],
      activeChat: {
        roomId: "room-1",
        peer: { id: "session-2" },
        startedAt: "2026-03-23T00:00:00.000Z",
        peerTyping: true,
        messages: [{ id: "message-1" }],
      },
      connectionState: "connected",
    },
    { type: "session-reset" },
  );

  assert.deepEqual(nextState, initialChatState);
});

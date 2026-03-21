import assert from "node:assert/strict";
import test from "node:test";

import { createRelayHub } from "../server/relay-hub.js";
import { createSocketController } from "../server/socket-controller.js";

function setup() {
  const delivered = [];
  const connectedClientIds = ["alpha", "beta"];
  let roomIndex = 0;
  let messageIndex = 0;

  const hub = createRelayHub({
    now: () => new Date("2026-03-21T09:00:00.000Z"),
    createRoomId: () => `room-${++roomIndex}`,
    createMessageId: () => `message-${++messageIndex}`
  });

  const controller = createSocketController({
    hub,
    sendToClient(clientId, payload) {
      delivered.push({ clientId, payload });
    },
    getConnectedClientIds() {
      return connectedClientIds;
    }
  });

  return { controller, delivered };
}

test("register emits the caller snapshot and refreshed presence lists", () => {
  const { controller, delivered } = setup();

  controller.onMessage("alpha", {
    type: "register",
    profile: { codename: "雾岛", mood: "calm" }
  });
  controller.onMessage("beta", {
    type: "register",
    profile: { codename: "余烬", mood: "quiet" }
  });

  assert.equal(delivered[0].clientId, "alpha");
  assert.equal(delivered[0].payload.type, "registered");
  assert.equal(delivered[1].clientId, "alpha");
  assert.equal(delivered[1].payload.type, "presence");
  assert.deepEqual(delivered.at(-2), {
    clientId: "alpha",
    payload: {
      type: "presence",
      peers: [
        {
          id: "beta",
          codename: "余烬",
          mood: "quiet",
          status: "available",
          connectedAt: "2026-03-21T09:00:00.000Z"
        }
      ]
    }
  });
  assert.deepEqual(delivered.at(-1), {
    clientId: "beta",
    payload: {
      type: "presence",
      peers: [
        {
          id: "alpha",
          codename: "雾岛",
          mood: "calm",
          status: "available",
          connectedAt: "2026-03-21T09:00:00.000Z"
        }
      ]
    }
  });
});

test("start-chat dispatches chat-started to both sides", () => {
  const { controller, delivered } = setup();

  controller.onMessage("alpha", {
    type: "register",
    profile: { codename: "雾岛", mood: "calm" }
  });
  controller.onMessage("beta", {
    type: "register",
    profile: { codename: "余烬", mood: "quiet" }
  });
  delivered.length = 0;

  controller.onMessage("alpha", { type: "start-chat", peerId: "beta" });

  assert.equal(delivered[0].clientId, "alpha");
  assert.equal(delivered[0].payload.type, "chat-started");
  assert.equal(delivered[1].clientId, "beta");
  assert.equal(delivered[1].payload.type, "chat-started");
  assert.equal(delivered[0].payload.roomId, "room-1");
  assert.equal(delivered[1].payload.roomId, "room-1");
});

test("message relay and disconnect notifications are forwarded through the controller", () => {
  const { controller, delivered } = setup();

  controller.onMessage("alpha", {
    type: "register",
    profile: { codename: "雾岛", mood: "calm" }
  });
  controller.onMessage("beta", {
    type: "register",
    profile: { codename: "余烬", mood: "quiet" }
  });
  controller.onMessage("alpha", { type: "start-chat", peerId: "beta" });
  delivered.length = 0;

  controller.onMessage("alpha", { type: "message", text: "你好" });

  assert.deepEqual(delivered[0], {
    clientId: "beta",
    payload: {
      type: "message",
      targetClientId: "beta",
      roomId: "room-1",
      message: {
        id: "message-1",
        senderId: "alpha",
        text: "你好",
        sentAt: "2026-03-21T09:00:00.000Z"
      }
    }
  });

  delivered.length = 0;
  controller.onDisconnect("alpha");

  assert.deepEqual(delivered[0], {
    clientId: "beta",
    payload: {
      type: "chat-ended",
      targetClientId: "beta",
      reason: "partner-disconnected"
    }
  });
});

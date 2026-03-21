import assert from "node:assert/strict";
import test from "node:test";

import { createRelayHub } from "../server/relay-hub.js";

function createHub() {
  let roomIndex = 0;
  let messageIndex = 0;

  return createRelayHub({
    now: () => new Date("2026-03-21T08:00:00.000Z"),
    createRoomId: () => `room-${++roomIndex}`,
    createMessageId: () => `message-${++messageIndex}`
  });
}

test("lists only available peers for each client", () => {
  const hub = createHub();

  hub.registerClient("alpha", { codename: "雾岛", mood: "calm" });
  hub.registerClient("beta", { codename: "余烬", mood: "quiet" });
  hub.registerClient("gamma", { codename: "微光", mood: "minimal" });

  assert.deepEqual(
    hub.getAvailablePeers("alpha").map((peer) => peer.id),
    ["beta", "gamma"]
  );
});

test("pairs two available clients and removes them from discovery", () => {
  const hub = createHub();

  hub.registerClient("alpha", { codename: "雾岛", mood: "calm" });
  hub.registerClient("beta", { codename: "余烬", mood: "quiet" });
  hub.registerClient("gamma", { codename: "微光", mood: "minimal" });

  const result = hub.startConversation("alpha", "beta");

  assert.equal(result.roomId, "room-1");
  assert.equal(result.events.length, 2);
  assert.deepEqual(
    hub.getAvailablePeers("gamma").map((peer) => peer.id),
    []
  );
});

test("relays messages without storing chat history", () => {
  const hub = createHub();

  hub.registerClient("alpha", { codename: "雾岛", mood: "calm" });
  hub.registerClient("beta", { codename: "余烬", mood: "quiet" });
  hub.startConversation("alpha", "beta");

  const events = hub.relayMessage("alpha", "你好");
  const snapshot = hub.getState();

  assert.equal(events.length, 1);
  assert.equal(events[0].targetClientId, "beta");
  assert.equal(events[0].message.text, "你好");
  assert.equal(snapshot.rooms[0].messages, undefined);
});

test("disconnecting one client releases the partner back to discovery", () => {
  const hub = createHub();

  hub.registerClient("alpha", { codename: "雾岛", mood: "calm" });
  hub.registerClient("beta", { codename: "余烬", mood: "quiet" });
  hub.registerClient("gamma", { codename: "微光", mood: "minimal" });
  hub.startConversation("alpha", "beta");

  const events = hub.disconnectClient("alpha");

  assert.equal(events[0].type, "chat-ended");
  assert.equal(events[0].targetClientId, "beta");
  assert.deepEqual(
    hub.getAvailablePeers("gamma").map((peer) => peer.id),
    ["beta"]
  );
});

test("typing indicators are relayed only inside an active conversation", () => {
  const hub = createHub();

  hub.registerClient("alpha", { codename: "雾岛", mood: "calm" });
  hub.registerClient("beta", { codename: "余烬", mood: "quiet" });
  hub.registerClient("gamma", { codename: "微光", mood: "minimal" });
  hub.startConversation("alpha", "beta");

  assert.deepEqual(hub.relayTyping("gamma", true), []);

  const events = hub.relayTyping("alpha", true);

  assert.equal(events.length, 1);
  assert.equal(events[0].targetClientId, "beta");
  assert.equal(events[0].isTyping, true);
});

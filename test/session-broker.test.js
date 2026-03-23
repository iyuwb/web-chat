import assert from "node:assert/strict";
import test from "node:test";

import { createRelayHub } from "../server/relay-hub.js";
import { createSessionBroker } from "../server/session-broker.js";

function createScheduler() {
  let now = 0;
  let taskIndex = 0;
  const tasks = new Map();

  return {
    schedule(callback, delay) {
      const id = `task-${++taskIndex}`;
      tasks.set(id, { callback, runAt: now + delay });
      return id;
    },

    cancel(id) {
      tasks.delete(id);
    },

    advanceBy(ms) {
      now += ms;
      const readyTasks = [...tasks.entries()]
        .filter(([, task]) => task.runAt <= now)
        .sort((left, right) => left[1].runAt - right[1].runAt);

      for (const [id, task] of readyTasks) {
        tasks.delete(id);
        task.callback();
      }
    },
  };
}

function setup() {
  const scheduler = createScheduler();
  let sessionIndex = 0;
  let roomIndex = 0;
  let messageIndex = 0;

  const broker = createSessionBroker({
    createSessionId: () => `session-${++sessionIndex}`,
    reconnectGraceMs: 5_000,
    scheduleTask(callback, delay) {
      return scheduler.schedule(callback, delay);
    },
    cancelTask(taskId) {
      scheduler.cancel(taskId);
    },
    hub: createRelayHub({
      now: () => new Date("2026-03-21T10:00:00.000Z"),
      createRoomId: () => `room-${++roomIndex}`,
      createMessageId: () => `message-${++messageIndex}`,
    }),
  });

  return { broker, scheduler };
}

test("createSession returns the caller snapshot and flushes queued presence on subscribe", () => {
  const { broker } = setup();

  const alpha = broker.createSession({ codename: "雾岛", mood: "calm" });
  const beta = broker.createSession({ codename: "余烬", mood: "quiet" });
  const delivered = [];

  broker.subscribe(alpha.sessionId, (event) => {
    delivered.push(event);
  });

  assert.equal(alpha.sessionId, "session-1");
  assert.deepEqual(alpha.self, {
    id: "session-1",
    codename: "雾岛",
    mood: "calm",
    status: "available",
    connectedAt: "2026-03-21T10:00:00.000Z",
  });
  assert.deepEqual(beta.peers, [
    {
      id: "session-1",
      codename: "雾岛",
      mood: "calm",
      status: "available",
      connectedAt: "2026-03-21T10:00:00.000Z",
    },
  ]);
  assert.deepEqual(delivered.at(-1), {
    type: "presence",
    peers: [
      {
        id: "session-2",
        codename: "余烬",
        mood: "quiet",
        status: "available",
        connectedAt: "2026-03-21T10:00:00.000Z",
      },
    ],
  });
});

test("start-chat fans out chat-started events and refreshes discovery for idle peers", () => {
  const { broker } = setup();

  const alpha = broker.createSession({ codename: "雾岛", mood: "calm" });
  const beta = broker.createSession({ codename: "余烬", mood: "quiet" });
  const gamma = broker.createSession({ codename: "微光", mood: "minimal" });

  const alphaEvents = [];
  const betaEvents = [];
  const gammaEvents = [];

  broker.subscribe(alpha.sessionId, (event) => {
    alphaEvents.push(event);
  });
  broker.subscribe(beta.sessionId, (event) => {
    betaEvents.push(event);
  });
  broker.subscribe(gamma.sessionId, (event) => {
    gammaEvents.push(event);
  });

  alphaEvents.length = 0;
  betaEvents.length = 0;
  gammaEvents.length = 0;

  broker.dispatchAction(alpha.sessionId, {
    type: "start-chat",
    peerId: beta.sessionId,
  });

  assert.deepEqual(alphaEvents[0], {
    type: "chat-started",
    targetClientId: "session-1",
    roomId: "room-1",
    peer: {
      id: "session-2",
      codename: "余烬",
      mood: "quiet",
      status: "chatting",
      connectedAt: "2026-03-21T10:00:00.000Z",
    },
    startedAt: "2026-03-21T10:00:00.000Z",
  });
  assert.deepEqual(betaEvents[0], {
    type: "chat-started",
    targetClientId: "session-2",
    roomId: "room-1",
    peer: {
      id: "session-1",
      codename: "雾岛",
      mood: "calm",
      status: "chatting",
      connectedAt: "2026-03-21T10:00:00.000Z",
    },
    startedAt: "2026-03-21T10:00:00.000Z",
  });
  assert.deepEqual(gammaEvents.at(-1), {
    type: "presence",
    peers: [],
  });
});

test("message and typing actions relay only to the active partner", () => {
  const { broker } = setup();

  const alpha = broker.createSession({ codename: "雾岛", mood: "calm" });
  const beta = broker.createSession({ codename: "余烬", mood: "quiet" });

  const alphaEvents = [];
  const betaEvents = [];

  broker.subscribe(alpha.sessionId, (event) => {
    alphaEvents.push(event);
  });
  broker.subscribe(beta.sessionId, (event) => {
    betaEvents.push(event);
  });

  broker.dispatchAction(alpha.sessionId, {
    type: "start-chat",
    peerId: beta.sessionId,
  });

  alphaEvents.length = 0;
  betaEvents.length = 0;

  broker.dispatchAction(alpha.sessionId, {
    type: "typing",
    isTyping: true,
  });
  broker.dispatchAction(alpha.sessionId, {
    type: "message",
    text: "你好，陌生人",
  });

  assert.deepEqual(alphaEvents, []);
  assert.deepEqual(betaEvents, [
    {
      type: "typing",
      targetClientId: "session-2",
      roomId: "room-1",
      isTyping: true,
    },
    {
      type: "message",
      targetClientId: "session-2",
      roomId: "room-1",
      message: {
        id: "message-1",
        senderId: "session-1",
        text: "你好，陌生人",
        sentAt: "2026-03-21T10:00:00.000Z",
      },
    },
  ]);
});

test("subscription teardown waits for a reconnect window before removing the session", () => {
  const { broker, scheduler } = setup();

  const alpha = broker.createSession({ codename: "雾岛", mood: "calm" });
  const beta = broker.createSession({ codename: "余烬", mood: "quiet" });
  const betaEvents = [];

  broker.subscribe(beta.sessionId, (event) => {
    betaEvents.push(event);
  });

  const unsubscribeAlpha = broker.subscribe(alpha.sessionId, () => {});

  unsubscribeAlpha();
  scheduler.advanceBy(4_999);

  assert.deepEqual(broker.getSession(alpha.sessionId), {
    id: "session-1",
    codename: "雾岛",
    mood: "calm",
    status: "available",
    connectedAt: "2026-03-21T10:00:00.000Z",
  });

  const reconnectUnsubscribe = broker.subscribe(alpha.sessionId, () => {});

  scheduler.advanceBy(1);

  assert.equal(broker.getSession(alpha.sessionId).id, "session-1");

  reconnectUnsubscribe();
  scheduler.advanceBy(5_000);

  assert.throws(() => broker.getSession(alpha.sessionId), {
    message: "Client session does not exist.",
  });
  assert.deepEqual(betaEvents.at(-1), {
    type: "presence",
    peers: [],
  });
});

test("disconnecting one chat participant releases the other participant back to discovery", () => {
  const { broker } = setup();

  const alpha = broker.createSession({ codename: "雾岛", mood: "calm" });
  const beta = broker.createSession({ codename: "余烬", mood: "quiet" });
  const gamma = broker.createSession({ codename: "微光", mood: "minimal" });

  const betaEvents = [];
  const gammaEvents = [];

  broker.subscribe(beta.sessionId, (event) => {
    betaEvents.push(event);
  });
  broker.subscribe(gamma.sessionId, (event) => {
    gammaEvents.push(event);
  });

  broker.dispatchAction(alpha.sessionId, {
    type: "start-chat",
    peerId: beta.sessionId,
  });

  betaEvents.length = 0;
  gammaEvents.length = 0;

  broker.disconnectSession(alpha.sessionId);

  assert.deepEqual(betaEvents[0], {
    type: "chat-ended",
    targetClientId: "session-2",
    reason: "partner-disconnected",
  });
  assert.deepEqual(gammaEvents.at(-1), {
    type: "presence",
    peers: [
      {
        id: "session-2",
        codename: "余烬",
        mood: "quiet",
        status: "available",
        connectedAt: "2026-03-21T10:00:00.000Z",
      },
    ],
  });
});

test("restoreSession returns the existing caller snapshot for refresh recovery", () => {
  const { broker } = setup();

  const alpha = broker.createSession({ codename: "雾岛", mood: "calm" });
  broker.createSession({ codename: "余烬", mood: "quiet" });

  assert.deepEqual(broker.restoreSession(alpha.sessionId), {
    sessionId: "session-1",
    self: {
      id: "session-1",
      codename: "雾岛",
      mood: "calm",
      status: "available",
      connectedAt: "2026-03-21T10:00:00.000Z",
    },
    peers: [
      {
        id: "session-2",
        codename: "余烬",
        mood: "quiet",
        status: "available",
        connectedAt: "2026-03-21T10:00:00.000Z",
      },
    ],
  });
});

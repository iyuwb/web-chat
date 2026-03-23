import assert from "node:assert/strict";
import test from "node:test";

test("GET /api/session restores an existing session snapshot", async () => {
  delete globalThis.__simpleChatSessionBroker;

  const { POST, GET } = await import("../app/api/session/route.js");

  const createResponse = await POST(
    new Request("http://localhost/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile: {
          codename: "雾岛",
          mood: "calm",
        },
      }),
    }),
  );
  const createdSession = await createResponse.json();

  const restoreResponse = await GET(
    new Request(
      `http://localhost/api/session?sessionId=${createdSession.sessionId}`,
      {
        method: "GET",
      },
    ),
  );

  assert.equal(restoreResponse.status, 200);
  assert.deepEqual(await restoreResponse.json(), createdSession);
});

test("GET /api/session rejects empty or unknown session ids", async () => {
  delete globalThis.__simpleChatSessionBroker;

  const { GET } = await import("../app/api/session/route.js");

  const missingResponse = await GET(
    new Request("http://localhost/api/session", {
      method: "GET",
    }),
  );
  const unknownResponse = await GET(
    new Request("http://localhost/api/session?sessionId=missing", {
      method: "GET",
    }),
  );

  assert.equal(missingResponse.status, 400);
  assert.deepEqual(await missingResponse.json(), {
    ok: false,
    message: "sessionId is required.",
  });

  assert.equal(unknownResponse.status, 404);
  assert.deepEqual(await unknownResponse.json(), {
    ok: false,
    message: "Client session does not exist.",
  });
});

import assert from "node:assert/strict";
import test from "node:test";

test("requestJson sends a POST request with a no-store cache policy", async () => {
  const { requestJson } = await import("../lib/chat-api.js");
  const previousFetch = globalThis.fetch;
  let capturedRequest = null;

  globalThis.fetch = async (url, init) => {
    capturedRequest = { url, init };
    return Response.json({ ok: true, sessionId: "session-1" });
  };

  try {
    const response = await requestJson("/api/session", {
      profile: { codename: "雾岛" },
    });

    assert.deepEqual(response, { ok: true, sessionId: "session-1" });
    assert.equal(capturedRequest.url, "/api/session");
    assert.equal(capturedRequest.init.method, "POST");
    assert.equal(capturedRequest.init.cache, "no-store");
    assert.equal(
      capturedRequest.init.headers["Content-Type"],
      "application/json",
    );
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("requestSessionSnapshot encodes the session id and throws on request failure", async () => {
  const { requestSessionSnapshot } = await import("../lib/chat-api.js");
  const previousFetch = globalThis.fetch;
  let requestedUrl = "";

  globalThis.fetch = async (url) => {
    requestedUrl = url;
    return new Response(JSON.stringify({ message: "Session not found." }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  try {
    await assert.rejects(
      requestSessionSnapshot("session/1"),
      /Session not found\./,
    );
    assert.equal(requestedUrl, "/api/session?sessionId=session%2F1");
  } finally {
    globalThis.fetch = previousFetch;
  }
});

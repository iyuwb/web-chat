import assert from "node:assert/strict";
import test from "node:test";

test("parseHashRoute normalizes supported chat views", async () => {
  const { parseHashRoute } = await import("../lib/hash-route.js");

  assert.equal(parseHashRoute(""), "entry");
  assert.equal(parseHashRoute("#"), "entry");
  assert.equal(parseHashRoute("#/"), "entry");
  assert.equal(parseHashRoute("#discover"), "discover");
  assert.equal(parseHashRoute("#/discover"), "discover");
  assert.equal(parseHashRoute("#/chat"), "chat");
  assert.equal(parseHashRoute("#/unknown"), "entry");
});

test("resolveHashRoute falls back to an allowed view for the current session state", async () => {
  const { resolveHashRoute } = await import("../lib/hash-route.js");

  assert.equal(
    resolveHashRoute("chat", { hasSession: false, hasActiveChat: false }),
    "entry"
  );
  assert.equal(
    resolveHashRoute("entry", { hasSession: true, hasActiveChat: false }),
    "discover"
  );
  assert.equal(
    resolveHashRoute("chat", { hasSession: true, hasActiveChat: false }),
    "discover"
  );
  assert.equal(
    resolveHashRoute("entry", { hasSession: true, hasActiveChat: true }),
    "chat"
  );
  assert.equal(
    resolveHashRoute("discover", { hasSession: true, hasActiveChat: true }),
    "discover"
  );
});

test("getHashHref returns stable URLs for each chat view", async () => {
  const { getHashHref } = await import("../lib/hash-route.js");

  assert.equal(getHashHref("entry"), "#/");
  assert.equal(getHashHref("discover"), "#/discover");
  assert.equal(getHashHref("chat"), "#/chat");
  assert.equal(getHashHref("unknown"), "#/");
});

import assert from "node:assert/strict";
import test from "node:test";

test("loadSessionCache reads a valid cached session id", async () => {
  const { SESSION_CACHE_KEY, loadSessionCache } = await import(
    "../lib/session-cache.js"
  );
  const storage = createStorage({
    [SESSION_CACHE_KEY]: JSON.stringify({ sessionId: "session-1" }),
  });

  assert.deepEqual(loadSessionCache(storage), {
    sessionId: "session-1",
  });
});

test("loadSessionCache falls back to null when cache is invalid", async () => {
  const { SESSION_CACHE_KEY, loadSessionCache } = await import(
    "../lib/session-cache.js"
  );

  assert.equal(loadSessionCache(createStorage()), null);
  assert.equal(
    loadSessionCache(
      createStorage({
        [SESSION_CACHE_KEY]: "{invalid json",
      })
    ),
    null
  );
});

test("saveSessionCache and clearSessionCache manage the persisted session id", async () => {
  const { SESSION_CACHE_KEY, saveSessionCache, clearSessionCache } = await import(
    "../lib/session-cache.js"
  );
  const storage = createStorage();

  saveSessionCache(storage, { sessionId: "session-2" });
  assert.equal(
    storage.getItem(SESSION_CACHE_KEY),
    JSON.stringify({ sessionId: "session-2" })
  );

  clearSessionCache(storage);
  assert.equal(storage.getItem(SESSION_CACHE_KEY), null);
});

function createStorage(initialState = {}) {
  const state = new Map(Object.entries(initialState));

  return {
    getItem(key) {
      return state.has(key) ? state.get(key) : null;
    },
    setItem(key, value) {
      state.set(key, `${value}`);
    },
    removeItem(key) {
      state.delete(key);
    },
  };
}

import assert from "node:assert/strict";
import test from "node:test";

test("createJsonResponse applies a no-store cache policy", async () => {
  const { createJsonResponse } = await import("../lib/api-response.js");

  const response = createJsonResponse({ ok: true }, { status: 201 });

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), { ok: true });
});

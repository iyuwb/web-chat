import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../components/chat-provider.jsx", import.meta.url),
  "utf8",
);

test("chat provider persists and clears the cached session id around session lifecycle", () => {
  assert.match(source, /loadSessionCache/);
  assert.match(source, /saveSessionCache/);
  assert.match(source, /clearSessionCache/);
  assert.match(source, /restoreSession/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../components/chat-provider.jsx", import.meta.url),
  "utf8",
);

test("chat provider persists and clears the cached session id around session lifecycle", () => {
  assert.match(source, /use-hash-route\.js/);
  assert.match(source, /use-session-stream\.js/);
  assert.match(source, /restoreSession/);
  assert.match(source, /chatReducer/);
  assert.match(source, /initialChatState/);
  assert.match(source, /requestJson/);
  assert.match(source, /requestSessionSnapshot/);
  assert.doesNotMatch(source, /new EventSource/);
  assert.doesNotMatch(source, /window\.addEventListener\("hashchange"/);
});

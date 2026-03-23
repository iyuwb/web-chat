import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../components/chat-screen.jsx", import.meta.url),
  "utf8",
);

test("chat screen delegates major sections to feature subcomponents", () => {
  assert.match(source, /chat\/chat-feed\.jsx/);
  assert.match(source, /chat\/chat-composer\.jsx/);
  assert.match(source, /chat\/chat-sidebar\.jsx/);
});

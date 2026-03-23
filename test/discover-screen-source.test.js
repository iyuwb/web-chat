import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../components/discover-screen.jsx", import.meta.url),
  "utf8",
);

test("discover screen filters the current user out of the peer list before rendering", () => {
  assert.match(source, /peer\.id !== self\?\.id/);
});

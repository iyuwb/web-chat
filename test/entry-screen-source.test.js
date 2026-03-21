import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../components/entry-screen.jsx", import.meta.url), "utf8");

test("entry screen retains the prototype-style desktop footer copy", () => {
  assert.match(source, /保持匿名\s+保持共鸣/);
});

test("entry screen uses horizontal mood pills for the desktop prototype layout", () => {
  assert.match(source, /flex-wrap justify-center gap-3/);
});

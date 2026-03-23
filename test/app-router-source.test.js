import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const notFoundSource = readFileSync(
  new URL("../app/not-found.jsx", import.meta.url),
  "utf8",
);
const globalErrorSource = readFileSync(
  new URL("../app/global-error.jsx", import.meta.url),
  "utf8",
);

test("app router provides a custom not-found screen", () => {
  assert.match(notFoundSource, /notFound/i);
  assert.match(notFoundSource, /返回首页|回到首页/);
});

test("app router provides a resettable global error boundary", () => {
  assert.match(globalErrorSource, /"use client"/);
  assert.match(globalErrorSource, /reset/);
});

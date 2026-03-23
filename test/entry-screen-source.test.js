import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../components/entry-screen.jsx", import.meta.url),
  "utf8",
);

test("entry screen retains the prototype-style desktop footer copy", () => {
  assert.match(source, /保持匿名\s+保持共鸣/);
});

test("entry screen uses horizontal mood pills for the desktop prototype layout", () => {
  assert.match(source, /flex-wrap justify-center gap-3/);
});

test("entry screen no longer keeps a separate mobile-only mood grid or mobile helper copy", () => {
  assert.doesNotMatch(source, /grid-cols-4/);
  assert.doesNotMatch(source, /Zero Storage/);
});

test("entry screen restores and persists the local draft profile", () => {
  assert.match(source, /useSyncExternalStore/);
  assert.match(source, /updateEntryProfileDraft/);
});

test("entry screen auto-resumes once per page load when a cached draft exists", () => {
  assert.match(source, /useEffect/);
  assert.match(source, /hadStoredDraftOnLoadRef/);
  assert.match(source, /shouldAutoResumeEntryProfile/);
  assert.match(source, /hasAttemptedAutoResume/);
});

test("entry screen restores a cached session before creating a replacement session", () => {
  assert.match(source, /loadSessionCache/);
  assert.match(source, /restoreSession/);
});

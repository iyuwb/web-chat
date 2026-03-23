import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const actionsSource = readFileSync(
  new URL("../app/api/actions/route.js", import.meta.url),
  "utf8",
);
const eventsSource = readFileSync(
  new URL("../app/api/events/route.js", import.meta.url),
  "utf8",
);
const sessionSource = readFileSync(
  new URL("../app/api/session/route.js", import.meta.url),
  "utf8",
);
const disconnectSource = readFileSync(
  new URL("../app/api/session/disconnect/route.js", import.meta.url),
  "utf8",
);

test("api routes share the common json response helper", () => {
  assert.match(actionsSource, /api-response\.js/);
  assert.match(eventsSource, /api-response\.js/);
  assert.match(sessionSource, /api-response\.js/);
  assert.match(disconnectSource, /api-response\.js/);
});

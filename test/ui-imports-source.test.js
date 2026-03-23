import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const appChromeSource = readFileSync(
  new URL("../components/app-chrome.jsx", import.meta.url),
  "utf8",
);
const discoverScreenSource = readFileSync(
  new URL("../components/discover-screen.jsx", import.meta.url),
  "utf8",
);
const chatScreenSource = readFileSync(
  new URL("../components/chat-screen.jsx", import.meta.url),
  "utf8",
);
const entryScreenSource = readFileSync(
  new URL("../components/entry-screen.jsx", import.meta.url),
  "utf8",
);
const providerSource = readFileSync(
  new URL("../components/chat-provider.jsx", import.meta.url),
  "utf8",
);

test("screen and chrome components import shared UI data modules instead of the prototype bundle", () => {
  assert.match(appChromeSource, /chat-ui-data\.js/);
  assert.match(discoverScreenSource, /chat-ui-data\.js/);
  assert.match(discoverScreenSource, /chat-formatters\.js/);
  assert.match(chatScreenSource, /chat-ui-data\.js/);
  assert.match(chatScreenSource, /chat-formatters\.js/);
  assert.match(entryScreenSource, /chat-ui-data\.js/);

  assert.doesNotMatch(appChromeSource, /prototype-data\.js/);
  assert.doesNotMatch(discoverScreenSource, /prototype-data\.js/);
  assert.doesNotMatch(chatScreenSource, /prototype-data\.js/);
  assert.doesNotMatch(entryScreenSource, /prototype-data\.js/);
});

test("chat provider imports the shared chat API helper", () => {
  assert.match(providerSource, /chat-api\.js/);
});

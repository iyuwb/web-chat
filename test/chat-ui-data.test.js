import assert from "node:assert/strict";
import test from "node:test";

import { CURRENT_USER_AVATAR, getPeerAvatar } from "../lib/chat-ui-data.js";

test("chat UI avatars use local public assets instead of remote image URLs", () => {
  assert.match(CURRENT_USER_AVATAR, /^\/avatars\/.+\.svg$/);
  assert.match(getPeerAvatar("peer-1"), /^\/avatars\/.+\.svg$/);
  assert.doesNotMatch(CURRENT_USER_AVATAR, /^https?:\/\//);
  assert.doesNotMatch(getPeerAvatar("peer-1"), /^https?:\/\//);
});

test("getPeerAvatar returns a stable local avatar for the same peer id", () => {
  assert.equal(getPeerAvatar("peer-1"), getPeerAvatar("peer-1"));
  assert.notEqual(getPeerAvatar("peer-1"), getPeerAvatar("peer-2"));
});

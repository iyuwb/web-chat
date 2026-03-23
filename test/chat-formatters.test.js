import assert from "node:assert/strict";
import test from "node:test";

test("getMoodOption still falls back to the default mood for unknown values", async () => {
  const { getMoodOption } = await import("../lib/chat-ui-data.js");

  assert.deepEqual(getMoodOption("自定义"), getMoodOption("calm"));
});

test("countVisibleChars ignores system messages and whitespace", async () => {
  const { countVisibleChars } = await import("../lib/chat-formatters.js");

  assert.equal(
    countVisibleChars([
      { kind: "system", text: "ignore me" },
      { kind: "peer", text: "你 好" },
      { kind: "self", text: "  世界  " },
    ]),
    4,
  );
});

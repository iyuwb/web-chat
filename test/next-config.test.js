import assert from "node:assert/strict";
import test from "node:test";

import nextConfig from "../next.config.js";

test("next config enables standalone output for self-hosting", () => {
  assert.equal(nextConfig.output, "standalone");
});

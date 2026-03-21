import assert from "node:assert/strict";
import test from "node:test";

import { getMoodOption } from "../components/prototype-data.js";

test("getMoodOption falls back to the default mood for unknown values", () => {
  assert.deepEqual(getMoodOption("自定义"), getMoodOption("calm"));
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { createPublicId } from "./publicId";
import { detectDevice } from "./device";

test("public ids are 8 uppercase characters", () => {
  const id = createPublicId();
  assert.equal(id.length, 8);
  assert.match(id, /^[0-9A-Z]+$/);
});

test("detects mobile devices", () => {
  assert.equal(detectDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)"), "mobile");
  assert.equal(detectDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X)"), "desktop");
});

import assert from "node:assert/strict";
import test from "node:test";
import { canListApplications, canReadAdminNotes, canReadCircle, memberSafe } from "./club-domain.ts";

test("anonymous and the wrong Circle are refused", () => {
  assert.equal(canListApplications({ role: "anonymous" }), false);
  assert.equal(canListApplications({ role: "member", userId: "u", circleId: "orion" }), false);
  assert.equal(canListApplications({ role: "admin", userId: "a" }), true);
  assert.equal(canReadAdminNotes({ role: "member", userId: "u", circleId: "orion" }), false);
  assert.equal(canReadCircle({ role: "member", userId: "u", circleId: "orion" }, "vega"), false);
  assert.equal(canReadCircle({ role: "member", userId: "u", circleId: "orion" }, "orion"), true);
});

test("a member payload drops private fields", () => {
  const safe = memberSafe({ name: "Asha & Nikhil", area: "Indiranagar", email: "a@b.c", dob: "1990-01-01", notes: "private" });
  assert.equal("email" in safe, false);
  assert.equal("dob" in safe, false);
  assert.equal("notes" in safe, false);
  assert.equal(safe.name, "Asha & Nikhil");
});

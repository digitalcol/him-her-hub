import assert from "node:assert/strict";
import test from "node:test";
import {
  balance,
  bestDate,
  canAssign,
  canTransition,
  displayStatus,
  normalizeInstagram,
  seatsLeft,
} from "./club-domain.ts";

test("application status only moves forward along the allowed path", () => {
  assert.equal(canTransition("NEW", "REVIEWING"), true);
  assert.equal(canTransition("REVIEWING", "WAITING_FOR_CIRCLE"), true);
  assert.equal(canTransition("WAITING_FOR_CIRCLE", "ASSIGNED"), true);
  assert.equal(canTransition("ASSIGNED", "DECLINED"), false);
  assert.equal(displayStatus("WAITING_FOR_CIRCLE", false), "WAITING FOR CIRCLE");
  assert.equal(displayStatus("ASSIGNED", true), "IN A CIRCLE");
});

test("a circle cannot take more couples than its capacity", () => {
  assert.equal(seatsLeft(10, 10), 0);
  assert.equal(canAssign("APPROVED", false, 10, 10), false);
  assert.equal(canAssign("WAITING_FOR_CIRCLE", false, 10, 9), true);
  assert.equal(canAssign("NEW", false, 10, 0), false);
});

test("kitty balance is credits minus debits", () => {
  const total = balance([
    { kind: "CONTRIBUTION", amount: 10000 },
    { kind: "CONTRIBUTION", amount: 10000 },
    { kind: "EXPENSE", amount: 12400 },
    { kind: "REFUND", amount: 500 },
    { kind: "ADJUSTMENT", amount: -100 },
  ]);
  assert.equal(total, 7000);
});

test("the date with the most yes votes is the one to hold", () => {
  assert.equal(
    bestDate({
      "6 May": [true, false, true],
      "13 May": [true, true, true],
      "20 May": [false, true, false],
    }),
    "13 May",
  );
});

test("instagram handles drop the @ and the profile URL", () => {
  assert.equal(normalizeInstagram("@thehimherhub"), "thehimherhub");
  assert.equal(normalizeInstagram("https://www.instagram.com/thehimherhub/"), "thehimherhub");
});

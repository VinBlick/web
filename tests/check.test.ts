import { test } from "node:test";
import assert from "node:assert/strict";
import { isAfterPurchase, type CheckCategory } from "../src/entities/check/model/types";

const cat = (c: Partial<CheckCategory>): CheckCategory => ({
  category: "SERVICE",
  found: false,
  count: 0,
  label: "Servicehistorie",
  ...c,
});

test("categories without free check are shown as 'after purchase'", () => {
  assert.equal(isAfterPurchase(cat({ status: "unknown" })), true);
  assert.equal(isAfterPurchase(cat({ status: "not_found" })), false);
  assert.equal(isAfterPurchase(cat({ found: true, status: "found", count: 3 })), false);
  // older API answers without status
  assert.equal(isAfterPurchase(cat({})), false);
});

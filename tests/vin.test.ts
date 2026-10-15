import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeVin,
  validateVin,
} from "../src/entities/vehicle/model/validation";

test("normalizes pasted VINs (case, spaces, dashes)", () => {
  assert.equal(normalizeVin(" wba3a5c50df123456 "), "WBA3A5C50DF123456");
  assert.equal(normalizeVin("WBA 3A5C5-0DF 123456"), "WBA3A5C50DF123456");
  assert.equal(validateVin(" wba3a5c50df123456 "), null);
  assert.equal(validateVin("WBA 3A5C5-0DF 123456"), null);
});

test("rejects empty, short, long and forbidden-character VINs", () => {
  for (const vin of [
    "",
    "ABC",
    "WBA3A5C50DF1234567",
    "WBA3A5C5ODF123456",
    "WBA3A5C5IDF123456",
    "WBA3A5C5QDF123456",
    "WBA3A5C5#DF123456",
  ])
    assert.notEqual(validateVin(vin), null, vin);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const { analyzePassword } = require("../src/services/strengthService");

test("analyzes a password and returns the expected structure", () => {
  const result = analyzePassword("Abc123!xyz");

  assert.equal(result.length, 10);
  assert.equal(result.diversity, 4);
  assert.deepEqual(result.characterTypes, {
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true
  });
  assert.equal(typeof result.estimatedEntropyBits, "number");
  assert.equal(typeof result.score, "number");
  assert.equal(typeof result.strength, "string");
  assert.ok(Array.isArray(result.suggestions));
});

test("detects a password containing only lowercase letters", () => {
  const result = analyzePassword("abcdefgh");

  assert.equal(result.diversity, 1);
  assert.equal(result.characterTypes.lowercase, true);
  assert.equal(result.characterTypes.uppercase, false);
  assert.equal(result.characterTypes.numbers, false);
  assert.equal(result.characterTypes.symbols, false);
  assert.ok(result.suggestions.includes("Use at least 12 characters."));
});

test("rejects an empty or non-string password", () => {
  assert.throws(() => analyzePassword(""), /non-empty string/i);
  assert.throws(() => analyzePassword(null), /non-empty string/i);
});

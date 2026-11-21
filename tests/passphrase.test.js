const test = require("node:test");
const assert = require("node:assert/strict");
const { generatePassphrase } = require("../src/services/passphraseService");

test("generates the default ten-word passphrase", () => {
  const result = generatePassphrase();

  assert.equal(result.wordCount, 10);
  assert.equal(result.wordlistSize, 256);
  assert.equal(result.passphrase.split("-").length, 10);
  assert.equal(result.estimatedEntropyBits, 80);
});

test("supports a custom word count and separator", () => {
  const result = generatePassphrase({ wordCount: 8, separator: "_" });

  assert.equal(result.passphrase.split("_").length, 8);
  assert.equal(result.estimatedEntropyBits, 64);
});

test("supports the maximum word count", () => {
  const result = generatePassphrase({ wordCount: 12, separator: "." });

  assert.equal(result.passphrase.split(".").length, 12);
  assert.equal(result.estimatedEntropyBits, 96);
});

test("rejects invalid word counts and separators", () => {
  assert.throws(() => generatePassphrase({ wordCount: 3 }), /between 6 and 12/i);
  assert.throws(() => generatePassphrase({ wordCount: 13 }), /between 6 and 12/i);
  assert.throws(() => generatePassphrase({ separator: "@" }), /separator/i);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const { generatePassword } = require("../src/services/generatorService");

test("generates a password with the requested length", () => {
  const password = generatePassword({ length: 20 });

  assert.equal(password.length, 20);
});

test("includes at least one character from every enabled group", () => {
  const password = generatePassword({
    length: 16,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true
  });

  assert.match(password, /[a-z]/);
  assert.match(password, /[A-Z]/);
  assert.match(password, /[0-9]/);
  assert.match(password, /[!@#$%^&*()\-_=+\[\]{};:,.?]/);
});

test("respects disabled character groups", () => {
  const password = generatePassword({
    length: 24,
    lowercase: true,
    uppercase: false,
    numbers: true,
    symbols: false
  });

  assert.match(password, /^[a-z0-9]+$/);
});

test("rejects invalid lengths and invalid character settings", () => {
  assert.throws(() => generatePassword({ length: 5 }), /between 8 and 128/i);
  assert.throws(() => generatePassword({ length: 129 }), /between 8 and 128/i);
  assert.throws(
    () => generatePassword({ length: 12, lowercase: "yes" }),
    /true or false/i
  );
  assert.throws(
    () => generatePassword({
      length: 12,
      lowercase: false,
      uppercase: false,
      numbers: false,
      symbols: false
    }),
    /at least one character type/i
  );
});

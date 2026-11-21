const test = require("node:test");
const assert = require("node:assert/strict");
const { hashPassword, verifyPassword } = require("../src/services/hashService");

test("hashes a password using Argon2id and verifies the correct password", async () => {
  const password = "Test-Password-2026!";
  const hashedPassword = await hashPassword(password);

  assert.match(hashedPassword, /^\$argon2id\$/);
  assert.notEqual(hashedPassword, password);
  assert.equal(await verifyPassword(password, hashedPassword), true);
});

test("rejects an incorrect password", async () => {
  const hashedPassword = await hashPassword("Correct-Password-123!");

  assert.equal(
    await verifyPassword("Incorrect-Password-123!", hashedPassword),
    false
  );
});

test("rejects an empty or non-string password", async () => {
  await assert.rejects(() => hashPassword(""), /valid password/i);
  await assert.rejects(() => hashPassword(null), /valid password/i);
});

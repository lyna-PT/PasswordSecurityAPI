const test = require("node:test");
const assert = require("node:assert/strict");
const {
  generateSecret,
  generateTOTP,
  verifyTOTP,
  verifyTOTPWithCounter,
  generateProvisioningURI
} = require("../src/services/totpService");

test("generates a Base32 secret", () => {
  const secret = generateSecret();

  assert.match(secret, /^[A-Z2-7]+$/);
  assert.ok(secret.length >= 32);
});

test("generates and verifies a six-digit TOTP at a fixed time", () => {
  const secret = generateSecret();
  const timestamp = 1_700_000_000_000;
  const token = generateTOTP(secret, timestamp);

  assert.match(token, /^\d{6}$/);
  assert.equal(verifyTOTP(secret, token, timestamp), true);
  assert.equal(verifyTOTP(secret, "000000", timestamp), token === "000000");
});

test("returns the matching counter for replay protection", () => {
  const secret = generateSecret();
  const timestamp = 1_700_000_000_000;
  const token = generateTOTP(secret, timestamp);
  const expectedCounter = Math.floor(timestamp / 1000 / 30);

  assert.equal(verifyTOTPWithCounter(secret, token, timestamp), expectedCounter);
  assert.equal(verifyTOTPWithCounter(secret, "bad", timestamp), null);
});

test("creates an authenticator provisioning URI", () => {
  const secret = generateSecret();
  const uri = generateProvisioningURI(secret, "test-user");

  assert.ok(uri.startsWith("otpauth://totp/"));
  assert.ok(uri.includes("secret="));
  assert.ok(uri.includes("issuer=PasswordSecurityAPI"));
  assert.ok(uri.includes("digits=6"));
  assert.ok(uri.includes("period=30"));
});

test("rejects invalid Base32 secrets and empty account names", () => {
  assert.throws(() => generateTOTP("INVALID0"), /Base32/i);
  assert.throws(() => generateProvisioningURI(generateSecret(), " "), /account name/i);
});

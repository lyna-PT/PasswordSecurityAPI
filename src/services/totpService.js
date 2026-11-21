
const crypto = require("crypto");

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TIME_STEP_SECONDS = 30;
const CODE_DIGITS = 6;

// Convert random bytes into a Base32 secret.
function encodeBase32(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

// Convert a Base32 secret back into bytes.
function decodeBase32(secret) {
  if (typeof secret !== "string" || secret.length === 0) {
    throw new Error("A valid Base32 secret is required.");
  }

  const normalized = secret.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const output = [];

  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);

    if (index === -1) {
      throw new Error("Invalid Base32 secret.");
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 255);
      value &= (1 << bits) - 1;
    }
  }

  if (value !== 0) {
    throw new Error("Invalid Base32 secret padding.");
  }

  return Buffer.from(output);
}

// Generate a random 160-bit secret.
function generateSecret() {
  return encodeBase32(crypto.randomBytes(20));
}

// Generate a six-digit TOTP code.
function generateTOTP(secret, timestamp = Date.now()) {
  const key = decodeBase32(secret);
  const counter = Math.floor(timestamp / 1000 / TIME_STEP_SECONDS);

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hash = crypto
    .createHmac("sha1", key)
    .update(counterBuffer)
    .digest();

  const offset = hash[hash.length - 1] & 0x0f;

  const binaryCode =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binaryCode % (10 ** CODE_DIGITS);

  return String(otp).padStart(CODE_DIGITS, "0");
}

// Verify the code, allowing a 30-second clock difference.
function verifyTOTP(secret, token, timestamp = Date.now()) {
  if (typeof token !== "string" || !/^\d{6}$/.test(token)) {
    return false;
  }

  for (const offset of [-1, 0, 1]) {
    const expected = generateTOTP(
      secret,
      timestamp + offset * TIME_STEP_SECONDS * 1000
    );

    const tokenBuffer = Buffer.from(token);
    const expectedBuffer = Buffer.from(expected);

    if (crypto.timingSafeEqual(tokenBuffer, expectedBuffer)) {
      return true;
    }
  }

  return false;
}


function verifyTOTPWithCounter(secret, token, timestamp = Date.now()) {
  if (typeof token !== "string" || !/^\d{6}$/.test(token)) {
    return null;
  }

  const currentCounter = Math.floor(
    timestamp / 1000 / TIME_STEP_SECONDS
  );

  for (const offset of [-1, 0, 1]) {
    const counter = currentCounter + offset;

    if (counter < 0) continue;

    const expected = generateTOTP(
      secret,
      (counter * TIME_STEP_SECONDS) * 1000
    );

    const tokenBuffer = Buffer.from(token);
    const expectedBuffer = Buffer.from(expected);

    if (crypto.timingSafeEqual(tokenBuffer, expectedBuffer)) {
      return counter;
    }
  }

  return null;
}


// Create a link that authenticator apps can use.
function generateProvisioningURI(secret, accountName, issuer = "PasswordSecurityAPI") {
  if (
    typeof accountName !== "string" ||
    accountName.trim().length === 0
  ) {
    throw new Error("A valid account name is required.");
  }

  const label = encodeURIComponent(`${issuer}:${accountName}`);

  const parameters = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(CODE_DIGITS),
    period: String(TIME_STEP_SECONDS)
  });

  return `otpauth://totp/${label}?${parameters.toString()}`;
}

module.exports = {
  generateSecret,
  generateTOTP,
  verifyTOTP,
  verifyTOTPWithCounter,
  generateProvisioningURI
};

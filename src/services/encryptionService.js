
const crypto = require("crypto");

function getEncryptionKey() {
  const key = process.env.TOTP_ENCRYPTION_KEY;

  if (!key) {
    throw new Error("TOTP encryption key is not configured.");
  }

  const buffer = Buffer.from(key, "base64");

  if (
    buffer.length !== 32 ||
    buffer.toString("base64") !== key
  ) {
    throw new Error("TOTP encryption key must be 32 valid Base64-encoded bytes.");
  }

  return buffer;
}

function encryptSecret(plainText) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    encryptedData: encrypted.toString("base64"),
    authTag: authTag.toString("base64")
  };
}

function decryptSecret(encryptedRecord) {
  const key = getEncryptionKey();

  const iv = Buffer.from(encryptedRecord.iv, "base64");
  const encryptedData = Buffer.from(
    encryptedRecord.encryptedData,
    "base64"
  );
  const authTag = Buffer.from(
    encryptedRecord.authTag,
    "base64"
  );

  if (
    iv.length !== 12 ||
    authTag.length !== 16 ||
    encryptedData.length === 0
  ) {
    throw new Error("Invalid encrypted secret record.");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}

module.exports = {
  encryptSecret,
  decryptSecret
};

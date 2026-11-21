
const {
  generateSecret,
  verifyTOTPWithCounter,
  generateProvisioningURI
} = require("../services/totpService");

const {
  encryptSecret,
  decryptSecret
} = require("../services/encryptionService");

const {
  savePendingSecret,
  getUserSecret,
  enableTwoFactor,
  markCounterAsUsed
} = require("../services/totpStorage");


function setupTwoFactor(req, res) {
  try {
    const { userId } = req.body;

    if (
      typeof userId !== "string" ||
      userId.trim().length === 0 ||
      userId.length > 100
    ) {
      return res.status(400).json({
        status: "error",
        message: "A valid userId is required."
      });
    }

    const existingUser = getUserSecret(userId);

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: existingUser.status === "enabled"
          ? "Two-factor authentication is already enabled."
          : "A pending setup already exists for this user."
      });
    }

    const secret = generateSecret();
    const encryptedSecret = encryptSecret(secret);

    savePendingSecret(userId, encryptedSecret);

    const provisioningURI = generateProvisioningURI(
      secret,
      userId
    );

    return res.status(201).json({
      status: "success",
      message: "Two-factor setup created. Add the secret to your authenticator app, then verify a code.",
      data: {
        userId,
        secret,
        provisioningURI,
        status: "pending"
      }
    });

  } catch (error) {
    console.error("2FA setup error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Could not set up two-factor authentication."
    });
  }
}


function verifyTwoFactor(req, res) {
  try {
    const { userId, token } = req.body;

    if (
      typeof userId !== "string" ||
      userId.trim().length === 0 ||
      userId.length > 100
    ) {
      return res.status(400).json({
        status: "error",
        message: "A valid userId is required."
      });
    }

    if (typeof token !== "string" || !/^\d{6}$/.test(token)) {
      return res.status(400).json({
        status: "error",
        message: "A six-digit verification code is required."
      });
    }

    const user = getUserSecret(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No two-factor setup found for this user."
      });
    }

    const secret = decryptSecret(user.secret);

    // Find the matching TOTP time counter.
    const matchedCounter = verifyTOTPWithCounter(secret, token);

    if (matchedCounter === null) {
      return res.status(401).json({
        status: "error",
        message: "Invalid or expired verification code."
      });
    }

    // Enable 2FA after the first valid enrollment code.
    if (user.status === "pending") {
      enableTwoFactor(userId);
    }

    // Reject a code whose time counter was already accepted.
    const accepted = markCounterAsUsed(userId, matchedCounter);

    if (!accepted) {
      return res.status(401).json({
        status: "error",
        message: "This verification code has already been used."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Verification successful.",
      data: {
        userId,
        twoFactorEnabled: true
      }
    });

  } catch (error) {
    console.error("2FA verification error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Could not verify the authentication code."
    });
  }
}


module.exports = {
  setupTwoFactor,
  verifyTwoFactor
};

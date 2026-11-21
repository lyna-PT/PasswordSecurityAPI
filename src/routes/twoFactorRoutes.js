
const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const {
  setupTwoFactor,
  verifyTwoFactor
} = require("../controllers/twoFactorController");

const setupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many setup attempts. Try again later."
  }
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many verification attempts. Try again later."
  }
});

router.post("/setup", setupLimiter, setupTwoFactor);
router.post("/verify", verifyLimiter, verifyTwoFactor);

module.exports = router;

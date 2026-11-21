
const express = require("express");

const router = express.Router();

const {
    checkPasswordStrength,
    createSecurePassword,
    createPassphrase,
    checkPasswordBreach,
    hashPasswordController
} = require("../controllers/passwordController");

router.post("/strength", checkPasswordStrength);
router.post("/generate", createSecurePassword);
router.post("/passphrase/generate", createPassphrase);
router.post("/breach-check", checkPasswordBreach);
router.post("/hash", hashPasswordController);

module.exports = router;

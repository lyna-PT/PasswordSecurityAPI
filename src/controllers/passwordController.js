
const { analyzePassword } = require("../services/strengthService");
const { generatePassphrase } = require("../services/passphraseService");
const { generatePassword } = require("../services/generatorService");
const { checkPasswordExposure } = require("../services/hibpService");
const { hashPassword } = require("../services/hashService");

function checkPasswordStrength(req, res) {
    try {
        const { password } = req.body;

        if (typeof password !== "string" || password.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Please provide a valid password."
            });
        }

        const result = analyzePassword(password);

        return res.status(200).json({
            status: "success",
            message: "Password analysis completed.",
            analysis: result
        });

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: error.message
        });
    }
}


function createSecurePassword(req, res) {
    try {
        const result = generatePassword(req.body);

        return res.status(200).json({
            status: "success",
            message: "Secure password generated successfully.",
            password: result
        });

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: error.message
        });
    }
}


function createPassphrase(req, res) {
    try {
        const result = generatePassphrase(req.body);

        return res.status(200).json({
            status: "success",
            message: "Passphrase generated successfully.",
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: error.message
        });
    }
}

async function checkPasswordBreach(req, res) {
  try {
    const { password } = req.body;

    if (
      typeof password !== "string" ||
      password.length === 0 ||
      password.length > 1024
    ) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid password."
      });
    }

    const result = await checkPasswordExposure(password);

    return res.status(200).json({
      status: "success",
      message: "Password breach check completed.",
      data: result
    });

  } catch (error) {
    console.error("Password breach check failed:", error.message);

    return res.status(502).json({
      status: "error",
      message: "Could not complete the breached-password check."
    });
  }
}
async function hashPasswordController(req, res) {
    try {
        const { password } = req.body;

        if (
            typeof password !== "string" ||
            password.length === 0 ||
            password.length > 1024
        ) {
            return res.status(400).json({
                status: "error",
                message: "Password must be a non-empty string of at most 1024 characters."
            });
        }

        const hashedPassword = await hashPassword(password);

        return res.status(200).json({
            status: "success",
            message: "Password hashed successfully using Argon2id.",
            data: {
                algorithm: "Argon2id",
                hashedPassword
            }
        });

    } catch (error) {
        console.error("Password hashing error:", error);

        return res.status(500).json({
            status: "error",
            message: "Password hashing failed."
        });
    }
}
module.exports = {
    checkPasswordStrength,
    createSecurePassword,
    createPassphrase,
    checkPasswordBreach,
    hashPasswordController
};
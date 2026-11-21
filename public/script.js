
// ============================================
// PASSWORD SECURITY CENTER
// Frontend API Integration
// ============================================

const API_BASE = "/api";

// ============================================
// DOM HELPERS
// ============================================

const getElement = (id) => document.getElementById(id);

function showText(id, text) {
    const element = getElement(id);

    if (element) {
        element.textContent = text;
    }
}

function showMessage(message, type = "info") {
    const element = getElement("analysis-message");

    element.textContent = message;
    element.dataset.type = type;
}

function setButtonLoading(button, loading, originalText) {
    button.disabled = loading;
    button.textContent = loading ? "Please wait..." : originalText;
}

// ============================================
// API REQUEST HELPER
// ============================================

async function apiRequest(endpoint, body) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok || result.status === "error") {
        throw new Error(
            result.message || "Something went wrong."
        );
    }

    return result;
}

// ============================================
// API CONNECTION STATUS
// ============================================

async function checkAPIConnection() {
    const statusElement = getElement("connection-status");

    try {
        const response = await fetch(`${API_BASE}/health`);
        const result = await response.json();

        if (!response.ok || result.status !== "success") {
            throw new Error("API unavailable");
        }

        statusElement.textContent = "Connected";
    } catch (error) {
        statusElement.textContent = "Disconnected";
        console.error("API connection error:", error);
    }
}

// ============================================
// SHOW / HIDE PASSWORD
// ============================================

getElement("toggle-password").addEventListener("click", () => {
    const passwordInput = getElement("password-input");
    const button = getElement("toggle-password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        button.textContent = "◎";
        button.setAttribute("aria-label", "Hide password");
    } else {
        passwordInput.type = "password";
        button.textContent = "◉";
        button.setAttribute("aria-label", "Show password");
    }
});

// ============================================
// FULL PASSWORD SECURITY ANALYSIS
// ============================================

getElement("analysis-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = getElement("password-input").value;
    const button = getElement("analyze-button");

    if (!password) {
        showMessage("Please enter a password.", "error");
        return;
    }

    const originalText = "✧ Run Full Security Analysis";

    setButtonLoading(button, true, originalText);
    showMessage("Running password security checks...", "info");

    // Reset previous results
    showText("strength-result", "Analyzing...");
    showText("strength-details", "Please wait...");
    showText("breach-result", "Checking...");
    showText("breach-details", "Contacting breach-check service...");
    showText("entropy-result", "-- bits");
    showText("diversity-result", "-- / 4");
    showText("recommendations-list", "Analyzing your password...");

    getElement("strength-progress").style.width = "0%";

    try {
        // Run both independent checks together
        const [strengthResponse, breachResponse] = await Promise.allSettled([
            apiRequest("/password/strength", { password }),
            apiRequest("/password/breach-check", { password })
        ]);

        let successCount = 0;

        // ------------------------------------
        // 1. PASSWORD STRENGTH RESULT
        // ------------------------------------

        if (strengthResponse.status === "fulfilled") {
            const analysis = strengthResponse.value.analysis;

            successCount++;

            showText("strength-result", analysis.strength);
            showText(
                "strength-details",
                `Score: ${analysis.score}/100 | Length: ${analysis.length} characters`
            );

            showText(
                "entropy-result",
                `${analysis.estimatedEntropyBits} bits`
            );

            showText(
                "diversity-result",
                `${analysis.diversity} / 4`
            );

            getElement("strength-progress").style.width =
                `${Math.min(100, Math.max(0, analysis.score))}%`;

            // Recommendations
            const recommendations = getElement("recommendations-list");
            recommendations.replaceChildren();

            const suggestions = Array.isArray(analysis.suggestions)
                ? [...analysis.suggestions]
                : [];

            if (analysis.strength === "Very Strong" ||
                analysis.strength === "Strong") {
                suggestions.unshift(
                    "Your password meets this service's strength criteria."
                );
            }

            if (suggestions.length === 0) {
                suggestions.push(
                    "No additional recommendations from the strength analyzer."
                );
            }

            suggestions.forEach((suggestion) => {
                const item = document.createElement("div");
                item.className = "recommendation-item";
                item.textContent = `✧ ${suggestion}`;
                recommendations.appendChild(item);
            });

        } else {
            showText("strength-result", "Unavailable");
            showText(
                "strength-details",
                strengthResponse.reason.message
            );

            console.error(
                "Strength analysis failed:",
                strengthResponse.reason
            );
        }

        // ------------------------------------
        // 2. BREACH CHECK RESULT
        // ------------------------------------

        if (breachResponse.status === "fulfilled") {
            const breach = breachResponse.value.data;

            successCount++;

            if (breach.isPwned) {
                showText("breach-result", "Found in breaches");
                showText(
                    "breach-details",
                    `This password appeared ${Number(breach.occurrences).toLocaleString()} times in known breach records.`
                );
            } else {
                showText("breach-result", "Not found");
                showText(
                    "breach-details",
                    "No match was found in the checked breach database. This does not guarantee safety."
                );
            }

        } else {
            showText("breach-result", "Unavailable");
            showText(
                "breach-details",
                breachResponse.reason.message
            );

            console.error(
                "Breach check failed:",
                breachResponse.reason
            );
        }

        // ------------------------------------
        // FINAL STATUS
        // ------------------------------------

        if (successCount === 2) {
            showMessage(
                "Security analysis completed successfully!",
                "success"
            );
        } else if (successCount === 1) {
            showMessage(
                "Partial report: one security check could not complete.",
                "warning"
            );
        } else {
            showMessage(
                "Both security checks failed. Check your API connection.",
                "error"
            );
        }

    } catch (error) {
        console.error("Analysis error:", error);
        showMessage(error.message, "error");
    } finally {
        setButtonLoading(button, false, originalText);
    }
});

// ============================================
// SECURE PASSWORD GENERATOR
// ============================================

getElement("generate-password").addEventListener("click", async () => {
    const button = getElement("generate-password");

    const options = {
        length: Number(getElement("password-length").value),
        lowercase: getElement("include-lowercase").checked,
        uppercase: getElement("include-uppercase").checked,
        numbers: getElement("include-numbers").checked,
        symbols: getElement("include-symbols").checked
    };

    setButtonLoading(button, true, "Generate Password");

    try {
        const result = await apiRequest(
            "/password/generate",
            options
        );

        showText("generated-password", result.password);

    } catch (error) {
        showText("generated-password", `Error: ${error.message}`);
    } finally {
        setButtonLoading(button, false, "Generate Password");
    }
});

// ============================================
// PASSPHRASE GENERATOR
// ============================================

getElement("generate-passphrase").addEventListener("click", async () => {
    const button = getElement("generate-passphrase");

    const options = {
        wordCount: Number(getElement("word-count").value),
        separator: getElement("word-separator").value
    };

    setButtonLoading(button, true, "Generate Passphrase");

    try {
        const result = await apiRequest(
            "/password/passphrase/generate",
            options
        );

        const data = result.data;

        showText(
            "generated-passphrase",
            `${data.passphrase}\n\nEstimated entropy: ${data.estimatedEntropyBits} bits`
        );

    } catch (error) {
        showText("generated-passphrase", `Error: ${error.message}`);
    } finally {
        setButtonLoading(button, false, "Generate Passphrase");
    }
});

// ============================================
// TWO-FACTOR AUTHENTICATION SETUP
// ============================================

getElement("setup-2fa").addEventListener("click", async () => {
    const button = getElement("setup-2fa");
    const userId = getElement("two-factor-user").value.trim();

    if (!userId) {
        showText("two-factor-setup-result", "Please enter a user ID.");
        return;
    }

    setButtonLoading(button, true, "Set Up 2FA");

    try {
        const result = await apiRequest("/2fa/setup", { userId });

        const data = result.data;

        const output = [
            result.message,
            "",
            `User ID: ${data.userId}`,
            `Status: ${data.status}`,
            `Secret: ${data.secret}`,
            "",
            "Add this secret to your authenticator app.",
            "Keep this secret private."
        ].join("\n");

        showText("two-factor-setup-result", output);

    } catch (error) {
        showText(
            "two-factor-setup-result",
            `Setup failed: ${error.message}`
        );
    } finally {
        setButtonLoading(button, false, "Set Up 2FA");
    }
});

// ============================================
// TWO-FACTOR AUTHENTICATION VERIFICATION
// ============================================

getElement("verify-2fa").addEventListener("click", async () => {
    const button = getElement("verify-2fa");

    const userId = getElement("two-factor-user").value.trim();
    const token = getElement("two-factor-token").value.trim();

    if (!userId || !/^\d{6}$/.test(token)) {
        showText(
            "two-factor-verify-result",
            "Enter a valid user ID and six-digit authenticator code."
        );
        return;
    }

    setButtonLoading(button, true, "Verify Code");

    try {
        const result = await apiRequest("/2fa/verify", {
            userId,
            token
        });

        showText(
            "two-factor-verify-result",
            `${result.message} Two-factor authentication is enabled.`
        );

        getElement("two-factor-token").value = "";

    } catch (error) {
        showText(
            "two-factor-verify-result",
            `Verification failed: ${error.message}`
        );
    } finally {
        setButtonLoading(button, false, "Verify Code");
    }
});

// ============================================
// ARGON2ID HASHING
// ============================================
document.getElementById("hash-button").addEventListener("click", async () => {
    const password = document.getElementById("password-input").value;
    const result = document.getElementById("hash-result");
    const button = document.getElementById("hash-button");

    if (!password) {
        result.textContent = "Please enter a password first.";
        return;
    }

    button.disabled = true;
    button.textContent = "Hashing...";

    try {
        const response = await apiRequest("/password/hash", {
            password
        });

        result.textContent =
            `Algorithm: ${response.data.algorithm}\n\n` +
            `Hash:\n${response.data.hashedPassword}`;

    } catch (error) {
        result.textContent = `Error: ${error.message}`;
    } finally {
        button.disabled = false;
        button.textContent = "Hash Password";
    }
});

// ============================================
// INITIALIZATION
// ============================================

checkAPIConnection();

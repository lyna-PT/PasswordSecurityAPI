
function analyzePassword(password) {
    if (typeof password !== "string" || password.length === 0) {
        throw new Error("Password must be a non-empty string");
    }

    const length = password.length;

    // Detect character categories
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);

    // Calculate character pool size
    let poolSize = 0;

    if (hasLowercase) poolSize += 26;
    if (hasUppercase) poolSize += 26;
    if (hasNumbers) poolSize += 10;
    if (hasSymbols) poolSize += 32;

    // Estimate theoretical entropy
    const entropy = length * Math.log2(poolSize);

    // Count diversity categories
    const diversity = [
        hasLowercase,
        hasUppercase,
        hasNumbers,
        hasSymbols
    ].filter(Boolean).length;

    // Calculate a simple score
    let score = 0;

    if (length >= 8) score += 20;
    if (length >= 12) score += 20;
    if (length >= 16) score += 20;

    score += diversity * 10;

    if (entropy >= 60) score += 10;

    score = Math.min(score, 100);

    // Determine strength level
    let strength;

    if (score < 30) {
        strength = "Very Weak";
    } else if (score < 50) {
        strength = "Weak";
    } else if (score < 70) {
        strength = "Moderate";
    } else if (score < 90) {
        strength = "Strong";
    } else {
        strength = "Very Strong";
    }

    // Generate recommendations
    const suggestions = [];

    if (length < 12) {
        suggestions.push("Use at least 12 characters.");
    }

    if (!hasLowercase) {
        suggestions.push("Add lowercase letters.");
    }

    if (!hasUppercase) {
        suggestions.push("Add uppercase letters.");
    }

    if (!hasNumbers) {
        suggestions.push("Add numbers.");
    }

    if (!hasSymbols) {
        suggestions.push("Add special characters.");
    }

    return {
        length,
        diversity,
        characterTypes: {
            lowercase: hasLowercase,
            uppercase: hasUppercase,
            numbers: hasNumbers,
            symbols: hasSymbols
        },
        estimatedEntropyBits: Number(entropy.toFixed(2)),
        score,
        strength,
        suggestions
    };
}

module.exports = {
    analyzePassword
};

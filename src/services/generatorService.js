
const crypto = require("crypto");

// Character groups
const CHARACTERS = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.?"
};

// Securely select a random character
function secureRandomCharacter(characters) {
    const index = crypto.randomInt(0, characters.length);
    return characters[index];
}

// Secure Fisher-Yates shuffle
function secureShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

// Generate a secure password
function generatePassword(options) {

    const {
        length,
        lowercase = true,
        uppercase = true,
        numbers = true,
        symbols = true
    } = options;

    // Validate password length
    if (!Number.isInteger(length) || length < 8 || length > 128) {
        throw new Error("Password length must be between 8 and 128.");
    }

    // Validate character options
    const settings = {
        lowercase,
        uppercase,
        numbers,
        symbols
    };

    for (const value of Object.values(settings)) {
        if (typeof value !== "boolean") {
            throw new Error("Character options must be true or false.");
        }
    }

    // Select enabled character groups
    const selectedGroups = Object.keys(settings)
        .filter(key => settings[key])
        .map(key => CHARACTERS[key]);

    if (selectedGroups.length === 0) {
        throw new Error("Select at least one character type.");
    }

    if (length < selectedGroups.length) {
        throw new Error(
            "Password length is too short for the selected character types."
        );
    }

    // Combine all selected characters
    const characterPool = selectedGroups.join("");

    const passwordCharacters = [];

    // Guarantee at least one character from every selected group
    for (const group of selectedGroups) {
        passwordCharacters.push(
            secureRandomCharacter(group)
        );
    }

    // Fill the remaining positions
    while (passwordCharacters.length < length) {
        passwordCharacters.push(
            secureRandomCharacter(characterPool)
        );
    }

    // Shuffle to avoid predictable character positions
    secureShuffle(passwordCharacters);

    return passwordCharacters.join("");
}

module.exports = {
    generatePassword
};


const crypto = require("crypto");

async function checkPasswordExposure(password) {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("A non-empty password is required.");
  }

  // Hash the password locally.
  const hash = crypto
    .createHash("sha1")
    .update(password, "utf8")
    .digest("hex")
    .toUpperCase();

  // Split the hash for the k-anonymity request.
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const url = `https://api.pwnedpasswords.com/range/${prefix}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "PasswordSecurityAPI/1.0",
      "Add-Padding": "true"
    }
  });

  if (!response.ok) {
    throw new Error("Breached-password service is unavailable.");
  }

  const responseText = await response.text();

  const matchingLine = responseText
    .split(/\r?\n/)
    .find(line => {
      const [returnedSuffix, count] = line.trim().split(":");
      return returnedSuffix === suffix && Number(count) > 0;
    });

  let occurrences = 0;

  if (matchingLine) {
    occurrences = Number(matchingLine.trim().split(":")[1]);
  }

  return {
    isPwned: occurrences > 0,
    occurrences,
    source: "Have I Been Pwned"
  };
}

module.exports = { checkPasswordExposure };

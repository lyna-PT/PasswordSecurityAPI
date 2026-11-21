
const fs = require("fs");
const path = require("path");

const DATA_DIRECTORY = path.join(__dirname, "../data");
const STORAGE_FILE = path.join(DATA_DIRECTORY, "totp-secrets.json");

function ensureStorage() {
  if (!fs.existsSync(DATA_DIRECTORY)) {
    fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
  }

  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, "{}", "utf8");
  }
}

function readUsers() {
  ensureStorage();

  try {
    const content = fs.readFileSync(STORAGE_FILE, "utf8");
    const users = JSON.parse(content);

    if (
      users === null ||
      typeof users !== "object" ||
      Array.isArray(users)
    ) {
      throw new Error("Invalid TOTP storage format.");
    }

    return users;
  } catch (error) {
    throw new Error("Could not read TOTP storage: " + error.message);
  }
}

function writeUsers(users) {
  ensureStorage();

  const temporaryFile = STORAGE_FILE + ".tmp";

  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(users, null, 2),
    { encoding: "utf8", mode: 0o600 }
  );

  fs.renameSync(temporaryFile, STORAGE_FILE);
}

function savePendingSecret(userId, encryptedSecret) {
  const users = readUsers();

  users[userId] = {
    secret: encryptedSecret,
    status: "pending",
    createdAt: new Date().toISOString(),
    enabledAt: null
  };

  writeUsers(users);
}

function getUserSecret(userId) {
  const users = readUsers();
  return users[userId] || null;
}

function enableTwoFactor(userId) {
  const users = readUsers();
  const user = users[userId];

  if (!user) {
    throw new Error("User enrollment not found.");
  }

  user.status = "enabled";
  user.enabledAt = new Date().toISOString();
  user.lastUsedCounter = -1;

  writeUsers(users);
}


function markCounterAsUsed(userId, counter) {
  const users = readUsers();
  const user = users[userId];

  if (!user || user.status !== "enabled") {
    return false;
  }

  const previousCounter = user.lastUsedCounter ?? -1;

  if (counter <= previousCounter) {
    return false;
  }

  user.lastUsedCounter = counter;
  writeUsers(users);

  return true;
}

module.exports = {
  savePendingSecret,
  getUserSecret,
  enableTwoFactor,
  markCounterAsUsed
};
const argon2 = require("argon2");


async function hashPassword(password) {
if (typeof password !== "string" || password.length === 0) {
throw new Error("A valid password is required");
}

return await argon2.hash(password, {
type: argon2.argon2id
});
}

async function verifyPassword(password, hashedPassword) {
return await argon2.verify(hashedPassword, password);
}

module.exports = {
hashPassword,
verifyPassword
};
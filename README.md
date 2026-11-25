# Password Security API

A JavaScript-based REST API that provides password security utilities, including password strength analysis, cryptographically secure password generation, passphrase generation, two-factor authentication (TOTP), and breached-password checking.

## 1. Project Overview

The Password Security API is designed to demonstrate practical password security techniques through a standalone RESTful microservice.

The project implements:

- **Password Strength Analysis:** Evaluates password length, character diversity, estimated entropy, and strength level.
- **Secure Password Generation:** Generates random passwords using Node.js cryptographic functions.
- **Passphrase Generation:** Creates memorable multi-word passphrases using a local 256-word list.
- **Two-Factor Authentication (2FA):** Implements Time-Based One-Time Passwords (TOTP) compatible with authenticator applications.
- **Password Hashing:** Uses Argon2id for secure password hashing and verification.
- **Breached Password Checking:** Uses the Have I Been Pwned Pwned Passwords API to check whether a password has appeared in known data breaches.

## 2. Technologies Used

- JavaScript (Node.js)
- Express.js
- Argon2
- Helmet
- Express Rate Limit
- Node.js Crypto module
- Have I Been Pwned API
- Node.js built-in test runner

## 3. Project Structure

PasswordSecurityAPI/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── routes/
│   │   ├── passwordRoutes.js
│   │   └── twoFactorRoutes.js
│   │
│   ├── controllers/
│   │   ├── passwordController.js
│   │   └── twoFactorController.js
│   │
│   ├── services/
│   │   ├── strengthService.js
│   │   ├── generatorService.js
│   │   ├── passphraseService.js
│   │   ├── hashService.js
│   │   ├── totpService.js
│   │   ├── encryptionService.js
│   │   ├── totpStorage.js
│   │   └── hibpService.js
│   │
│   └── data/
│
├── tests/
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

### Frontend

The `public/` directory contains the web interface served by Express.js.

- `index.html`: Defines the structure and content of the web interface.
- `style.css`: Controls the visual design, layout, colors, and responsive styling.
- `script.js`: Handles frontend interactions and communicates with the backend API using HTTP requests.

## 4. Installation and Configuration

### Prerequisites

- Node.js (version 22 or compatible).
- npm.
- VS Code or another code editor.

### Step 1: Install dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

### Step 2: Configure environment variables

Create a `.env` file in the project root.

Add:

```env
PORT=3000
TOTP_ENCRYPTION_KEY=YOUR_BASE64_32_BYTE_KEY
```

Generate a secure encryption key using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Replace the placeholder with the generated key.

**Important:** Keep `.env` private. Never upload it to GitHub or include it in project submissions.

### Step 3: Start the server

```bash
npm start
```

The API will run at:

```text
http://localhost:3000
```

### Step 4: Test the application

Run the automated tests:

```bash
npm test
```

## 5. API Documentation

Base URL:

```text
http://localhost:3000
```

All request and response bodies use JSON.

### 5.1 Health Check

**GET** `/api/health`

Checks whether the API is running.

### 5.2 Password Strength Analysis

**POST** `/api/password/strength`

Request:

```json
{
  "password": "MyExample123!"
}
```

Evaluates password length, character categories, estimated entropy, strength score, and recommendations.

### 5.3 Secure Password Generation

**POST** `/api/password/generate`

Request:

```json
{
  "length": 16,
  "lowercase": true,
  "uppercase": true,
  "numbers": true,
  "symbols": true
}
```

Generates a cryptographically secure random password.

Supported length: 8–128 characters.

### 5.4 Passphrase Generation

**POST** `/api/password/passphrase/generate`

Request:

```json
{
  "wordCount": 10,
  "separator": "-"
}
```

Generates a passphrase using randomly selected words from the local wordlist.

Supported word count: 6–12.

Supported separators: `-`, `_`, `.`, and space.

### 5.5 Password Breach Check

**POST** `/api/password/breach-check`

Request:

```json
{
  "password": "example-password"
}
```

Checks whether the password appears in the Have I Been Pwned database.

The integration uses the k-anonymity model: only the first five characters of the SHA-1 password hash are sent to the external service. The complete password is not transmitted.

### 5.6 Two-Factor Authentication Setup

**POST** `/api/2fa/setup`

Request:

```json
{
  "userId": "user001"
}
```

Generates a TOTP secret and provisioning URI compatible with authenticator applications.

The returned secret can be added to an authenticator application. It should be treated as sensitive information.

### 5.7 Two-Factor Authentication Verification

**POST** `/api/2fa/verify`

Request:

```json
{
  "userId": "user001",
  "token": "123456"
}
```

Verifies the six-digit TOTP code and enables two-factor authentication when the initial setup is successful.

The example code is illustrative. Use the current code displayed in your authenticator application.

## 6. Security Features

The project includes several security mechanisms:

- **Argon2id:** Password hashing and verification.
- **Cryptographically Secure Randomness:** Node.js `crypto.randomBytes()` and `crypto.randomInt()`.
- **AES-256-GCM:** Encryption and integrity protection for stored TOTP secrets.
- **TOTP:** Time-based authentication codes with a limited validity window.
- **Replay Protection:** Prevents reuse of an already accepted TOTP counter.
- **Rate Limiting:** Limits API requests and authentication attempts.
- **Helmet:** Adds HTTP security headers.
- **Request Size Limiting:** Restricts JSON request payload size.
- **Environment Variables:** Keeps encryption keys outside the source code.
- **HIBP k-Anonymity:** Avoids transmitting complete passwords during breach checks.

## 7. Automated Testing

The project uses Node.js's built-in test runner, avoiding the need for an additional testing framework.

Run:

```bash
npm test
```

The test suite covers:

| Test file | Functionality |
|---|---|
| strength.test.js | Password strength analysis |
| generator.test.js | Secure password generation |
| passphrase.test.js | Passphrase generation |
| hash.test.js | Argon2id hashing and verification |
| totp.test.js | TOTP generation and verification |
| hibp.test.js | Breached-password checking |

**Current test results:** 24 tests passed, 0 failed.

## 8. Limitations and Future Improvements

The current implementation is an educational microservice prototype.

Potential future improvements include:

- Integrating a database for persistent user and authentication management.
- Adding user registration and login.
- Implementing authentication and authorization for protected endpoints.
- Using an official, larger Diceware wordlist.
- Improving password strength analysis with dictionary and pattern detection.
- Adding HTTPS and production deployment configuration.
- Adding account recovery and 2FA disable procedures.
- Improving storage concurrency and multi-user support.

## 9. Security Considerations

- Never expose the TOTP encryption key.
- Never commit `.env` or generated TOTP storage files.
- Do not log passwords, TOTP secrets, or authentication tokens.
- A password not found in the HIBP database is not guaranteed to be safe.
- The password strength score is an educational heuristic, not a definitive security measurement.
- The current JSON-based TOTP storage is intended for a local demonstration, not production-scale concurrent use.

## 10. Conclusion

The Password Security API demonstrates several important password security concepts through practical JavaScript implementation.

It combines password analysis, secure generation, passphrase creation, password hashing, two-factor authentication, and breached-password detection in one RESTful microservice.

The project provides a foundation for understanding how modern applications can strengthen password protection and authentication.
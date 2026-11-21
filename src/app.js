const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const passwordRoutes = require("./routes/passwordRoutes");
const twoFactorRoutes = require("./routes/twoFactorRoutes");
const path = require("path");

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/api/2fa", twoFactorRoutes);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    error: "Too many requests. Please try again later."
  }
});

app.use("/api", limiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Password Security API is running!",
    timestamp: new Date().toISOString()
  });
});

// ✅ Mount password routes FIRST
app.use("/api/password", passwordRoutes);

// ✅ 404 handler LAST, and it should only send a response
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found"
  });
});

module.exports = app;
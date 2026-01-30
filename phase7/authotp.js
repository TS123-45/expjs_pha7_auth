const express = require("express");
const router = express.Router();
const pool = require("./db");

// Temporary in-memory store (learning purpose)
const otpStore = {};

// -------- REQUEST OTP --------
router.post("/requestotp", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username required" });
  }

  // Check if user exists in DB
  const sql = "SELECT id FROM users WHERE username = ?";
  pool.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not registered" });
    }

    // User exists → generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[username] = {
      otp,
      expiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes
    };

    console.log(`OTP for ${username}:`, otp);

    res.json({ message: "OTP generated (check server console)" });
  });
});

// -------- VERIFY OTP --------
router.post("/verifyotp", (req, res) => {
  const { username, otp } = req.body;

  const stored = otpStore[username];

  if (!stored) {
    return res.status(400).json({ message: "No OTP requested" });
  }

  if (Date.now() > stored.expiresAt) {
    delete otpStore[username];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (stored.otp != otp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  delete otpStore[username];
  res.json({ message: "OTP verified successfully" });
});

module.exports = router;
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("./db");

const router = express.Router();

// Temporary OTP store (learning purpose)
const otpStore = {};

// ---------- STEP 1: PASSWORD CHECK ----------
router.post("/login-password", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  pool.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Password verified → generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[username] = { otp, expiresAt: Date.now() + 2 * 60 * 1000 }; // 2 min

    console.log(`MFA OTP for ${username}:`, otp);

    res.json({ message: "Password verified. OTP sent." });
  });
});

// ---------- STEP 2: OTP CHECK ----------
router.post("/login-otp", (req, res) => {
  const { username, otp } = req.body;

  const stored = otpStore[username];

  if (!stored) {
    return res.status(400).json({ message: "OTP not requested" });
  }

  if (Date.now() > stored.expiresAt) {
    delete otpStore[username];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (stored.otp != otp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  // MFA success
  delete otpStore[username];
  res.json({ message: "MFA login successful" });
});

module.exports = router;
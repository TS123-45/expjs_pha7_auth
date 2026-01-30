const express = require("express");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const pool = require("./db");

const router = express.Router();

/* Email transporter */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    pool.query(sql, [username, hashedPassword], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "User already exists" });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "User registered successfully" });
    });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* -------- STEP 1: LOGIN + GENERATE OTP -------- */
router.post("/login-generate-otp", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username (email) and password required" });
  }

  // Check user
  const userSql = "SELECT * FROM users WHERE username = ?";
  pool.query(userSql, [username], async (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    if (users.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = users[0];

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = Date.now() + 2 * 60 * 1000;

    // Store OTP in DB
    const insertOtp ="INSERT INTO user_otps (username, otp, expires_at) VALUES (?, ?, ?)";

    pool.query(insertOtp, [username, otp, expiresAt], async (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Send OTP via Email (username is the email)
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: username,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. Valid for 2 minutes.`,
      });

      res.json({ message: "OTP sent to email" });
    });
  });
});

/* -------- STEP 2: VERIFY OTP -------- */
router.post("/verify-otp-db", (req, res) => {
  const { username, otp } = req.body;

  const sql ="SELECT * FROM user_otps WHERE username = ? ORDER BY id DESC LIMIT 1";
  pool.query(sql, [username], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) {
      return res.status(400).json({ message: "No OTP found" });
    }

    const record = rows[0];

    // Expiry check
    if (Date.now() > record.expires_at) {
      pool.query("DELETE FROM user_otps WHERE username = ?", [username]);
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP match
    if (record.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Success → cleanup
    pool.query("DELETE FROM user_otps WHERE username = ?", [username]);
    res.json({ message: "OTP verified. Login successful" });
  });
});

module.exports = router;
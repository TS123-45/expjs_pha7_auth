const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./jwtmiddleware");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    pool.query(sql, [username, hashedPassword], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Signup successful" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";
  pool.query(sql, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // JWT PART
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      message: "Login successful",
      token: token,
    });
  });
});

router.post("/posting", authMiddleware, (req, res) => {
  const { name, age, city } = req.body;

  const sql = "INSERT INTO viewtable (name, age, city) VALUES (?, ?, ?)";

  pool.query(sql, [name, age, city], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error inserting data", error: err.message });
    }

    res.json({ message: "Data inserted successfully" });
  });
});

router.get("/viewing", authMiddleware, (req, res) => {
  const sql = "SELECT * FROM viewtable";

  pool.query(sql, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error retrieving data", error: err.message });
    }

    res.json({ message: "Data retrieved successfully" });
  });
});

router.put("/updating/:id", authMiddleware, (req, res) => {
  const { name, age, city } = req.body;

  const sql = "UPDATE viewtable SET name=?, age=?, city=? WHERE id=?";

  pool.query(sql, [name, age, city, req.params.id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error updating data", error: err.message });
    }

    res.json({ message: "Data updated successfully" });
  });
});

router.delete("/deleting/:id", authMiddleware, (req, res) => {

  const sql = "DELETE FROM viewtable WHERE id = ?";

  pool.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error deleting data", error: err.message });
    }

    res.json({ message: "Data deleted successfully" });
  });
});

module.exports = router;

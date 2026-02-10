const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const authMiddleware = require("./jwtmiddleware");

const router = express.Router();

// Any logged-in user
const anyUser = function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Login required" });
  }
  next();
};

// Admin only
const adminOnly = function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Login required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};

// Teacher OR Admin
const teacherOrAdmin = function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Login required" });
  }

  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Teacher or Admin access only" });
  }

  next();
};

// SIGNUP (NO JWT)
router.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO userslist (username, password, role) VALUES (?, ?, ?)";

    pool.query(sql, [username, hashedPassword, role], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Signup successful" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN (JWT CREATED)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM userslist WHERE username = ?";
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

    const token = jwt.sign(
      {
        id: user.user_id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      message: "Login successful",
      token,
    });
  });
});

/* -------------------------------------------------
   VIEW MARKS
   Student → own marks
   Teacher/Admin → all marks
------------------------------------------------- */
router.get("/marks", authMiddleware, anyUser, (req, res) => {
  let sql;
  let params = [];

  if (req.user.role === "student") {
    sql = "SELECT * FROM marklist WHERE student_id = ?";
    params = [req.user.id];
  } else {
    sql = "SELECT * FROM marklist";
  }

  pool.query(sql, params, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching marks", error: err.message });
    }

    res.json(result);
  });
});

/* -------------------------------------------------
   UPDATE MARKS
   Teacher / Admin
------------------------------------------------- */
router.put("/marks/:id", authMiddleware, teacherOrAdmin, (req, res) => {
  const { marks } = req.body;

  const sql = "UPDATE marklist SET marks=? WHERE mark_id=?";

  pool.query(sql, [marks, req.params.id], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error updating marks", error: err.message });
    }

    res.json({ message: "Marks updated successfully" });
  });
});

/* -------------------------------------------------
   ADD MARKS
   Admin only
------------------------------------------------- */
router.post("/marks", authMiddleware, adminOnly, (req, res) => {
  const { student_id, subject, marks } = req.body;

  const sql =
    "INSERT INTO marklist (student_id, subject, marks) VALUES (?, ?, ?)";

  pool.query(sql, [student_id, subject, marks], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error inserting marks", error: err.message });
    }

    res.json({ message: "Marks added successfully" });
  });
});

/* -------------------------------------------------
   DELETE MARKS
   Admin only
------------------------------------------------- */
router.delete("/marks/:id", authMiddleware, adminOnly, (req, res) => {
  const sql = "DELETE FROM marklist WHERE mark_id=?";

  pool.query(sql, [req.params.id], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error deleting marks", error: err.message });
    }

    res.json({ message: "Marks deleted successfully" });
  });
});

module.exports = router;

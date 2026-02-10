const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const adminandusersapiRoutes = require("./adminandusersapi");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(adminandusersapiRoutes);

app.get(/^\/signup(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get(/^\/login(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get(/^\/student(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "student.html"));
});

app.get(/^\/teacher(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "teacher.html"));
});

app.get(/^\/admin(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const apiRoutes = require("./jwtapi.js");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiRoutes);

app.get(/^\/signup(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get(/^\/login(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "jwtlogin.html"));
});

app.get(/^\/create(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "jwtcreate.html"));
});

app.get(/^\/read(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "jwtread.html"));
});

app.get(/^\/update(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "jwtupdate.html"));
});

app.get(/^\/delete(?:\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "jwtdelete.html"));
});

const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

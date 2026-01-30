const express = require("express");
const path = require("path");

const app = express();
const PORT = 3500;

app.use(express.json());
app.use(express.static("public"));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

const authRouter = require("./authpassword");
app.use(authRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require("express");
const path = require("path");
const passport = require("passport");
require("dotenv").config();

// load Google strategy
require("./googlepassport");

const app = express();
const PORT = process.env.PORT || 3500;

app.use(express.json());
app.use(express.static("public"));

// passport init ONLY (no session)
app.use(passport.initialize());

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "googlelogin.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "googlesuccess.html"));
});

const authRouter = require("./googleauth");
app.use(authRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

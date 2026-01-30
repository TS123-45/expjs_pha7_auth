const express = require("express");
const path = require("path");

const app = express();
const PORT = 3500;

app.use(express.json());
app.use(express.static("public"));

app.get("/mfa", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mfa.html"));
});

const mfaRouter = require("./authmfa");
app.use(mfaRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
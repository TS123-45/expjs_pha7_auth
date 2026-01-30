const express = require("express");
const path = require("path");

const app = express();
const PORT = 3500;

app.use(express.json());
app.use(express.static("public"));

app.get("/otp", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "otp.html"));
});

const otpRouter = require("./authotp");
app.use(otpRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
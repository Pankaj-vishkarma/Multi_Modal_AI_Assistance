const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.routes");

router.use("/auth", authRoutes);
router.use("/upload", require("./upload.routes"));
router.use("/analyze", require("./analyze.routes"));
router.use("/chat", require("./chat.routes"));

module.exports = router;
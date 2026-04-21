const express = require("express");
const router = express.Router();

router.use("/upload", require("./upload.routes"));
router.use("/analyze", require("./analyze.routes"));
router.use("/chat", require("./chat.routes"));

module.exports = router;
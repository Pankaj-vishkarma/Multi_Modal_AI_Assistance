const express = require("express");
const router = express.Router();
const controller = require("../controllers/upload.controller");
const upload = require("../middlewares/upload.middleware");

router.post("/", upload.single("file"), controller.uploadFile);

module.exports = router;
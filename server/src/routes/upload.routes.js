const express = require("express");
const router = express.Router();
const controller = require("../controllers/upload.controller");
const { upload, handleUploadError } = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");

router.post("/", auth, upload.single("file"), handleUploadError, controller.uploadFile);

module.exports = router;

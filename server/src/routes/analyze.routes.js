const express = require("express");
const router = express.Router();
const controller = require("../controllers/analyze.controller");

router.post("/image", controller.analyzeImage);
router.post("/video", controller.analyzeVideo);
router.post("/audio", controller.analyzeAudio);
router.post("/document", controller.analyzeDocument);

module.exports = router;
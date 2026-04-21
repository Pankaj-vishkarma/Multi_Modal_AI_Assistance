const express = require("express");
const router = express.Router();
const controller = require("../controllers/analyze.controller");
const upload = require("../middlewares/upload.middleware");

router.post("/image", controller.analyzeImage);
router.post("/video", controller.analyzeVideo);
router.post("/audio", controller.analyzeAudio);
router.post("/document", controller.analyzeDocument);


router.post(
    "/compare-images",
    upload.array("images", 5),
    controller.compareImages
);

module.exports = router;
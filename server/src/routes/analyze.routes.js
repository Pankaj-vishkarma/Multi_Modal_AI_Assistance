const express = require("express");
const router = express.Router();
const controller = require("../controllers/analyze.controller");
const { upload, handleUploadError } = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");

router.post("/image", auth, controller.analyzeImage);
router.post("/video", auth, controller.analyzeVideo);
router.post("/audio", auth, controller.analyzeAudio);
router.post("/document", auth, controller.analyzeDocument);


router.post(
    "/compare-images",
    auth,
    upload.array("images", 5),
    handleUploadError,
    controller.compareImages
);

module.exports = router;

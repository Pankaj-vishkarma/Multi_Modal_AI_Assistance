const express = require("express");
const router = express.Router();
const controller = require("../controllers/chat.controller");

router.post("/", controller.chat);
router.post("/stream", controller.streamChat);

module.exports = router;
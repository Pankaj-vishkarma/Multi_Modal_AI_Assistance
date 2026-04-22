const express = require("express");
const router = express.Router();
const controller = require("../controllers/chat.controller");
const auth = require("../middlewares/auth.middleware");

// Protected chat routes
router.post("/", auth, controller.chat);
router.post("/stream", auth, controller.streamChat);

//  Chat history
router.get("/history", auth, controller.getHistory);

module.exports = router;
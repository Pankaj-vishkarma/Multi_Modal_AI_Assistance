const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
        },
        content: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", schema);
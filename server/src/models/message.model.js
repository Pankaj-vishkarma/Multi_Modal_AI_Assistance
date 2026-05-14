const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        // link message to user
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // keep this (future use: multiple chats)
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
        },

        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },

        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", schema);
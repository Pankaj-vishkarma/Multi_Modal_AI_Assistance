const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        fileName: String,
        filePath: String,
        fileType: String,
        size: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Media", schema);
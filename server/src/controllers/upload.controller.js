const asyncHandler = require("../middlewares/async.middleware");
const Media = require("../models/media.model");

exports.uploadFile = asyncHandler(async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded",
        });
    }

    const saved = await Media.create({
        fileName: file.filename,
        filePath: file.path,
        fileType: file.mimetype,
        size: file.size,
    });

    // IMPORTANT: create public URL
    const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

    const cleanPath = file.path
        .replace(/\\/g, "/")
        .replace("src/", "");

    const fileUrl = `${BASE_URL}/${cleanPath}`;

    res.json({
        success: true,
        url: fileUrl,
        data: saved,
    });
});
const asyncHandler = require("../middlewares/async.middleware");
const Media = require("../models/media.model");
const { toPublicUploadUrl } = require("../config/storage");

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

    const fileUrl = toPublicUploadUrl(file.filename, req);

    res.json({
        success: true,
        url: fileUrl,
        fileUrl,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        data: saved,
    });
});

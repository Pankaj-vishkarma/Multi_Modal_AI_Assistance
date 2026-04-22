const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// ================= ENSURE UPLOAD FOLDER EXISTS =================

const uploadDir = "src/storage/uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ================= STORAGE =================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uuidv4() + ext);
    },
});

// ================= FILE FILTER =================

const allowedMimeTypes = [
    // ===== IMAGES =====
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/bmp",
    "image/gif",
    "image/tiff",
    "image/svg+xml",

    // ===== VIDEOS =====
    "video/mp4",
    "video/quicktime", // mov
    "video/x-msvideo", // avi
    "video/x-matroska", // mkv
    "video/webm",
    "video/x-flv",
    "video/x-ms-wmv",
    "video/mpeg",

    // ===== AUDIO =====
    "audio/mpeg",
    "audio/wav",
    "audio/aac",
    "audio/ogg",

    // ===== DOCUMENT =====
    "application/pdf",
];

const allowedExtensions = [
    // ===== IMAGES =====
    ".jpg",
    ".jpeg",
    ".png",
    ".jfif",
    ".webp",
    ".bmp",
    ".gif",
    ".tiff",
    ".svg",

    // ===== VIDEOS =====
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".flv",
    ".wmv",
    ".mpeg",
    ".mpg",

    // ===== AUDIO =====
    ".mp3",
    ".wav",
    ".aac",
    ".ogg",

    // ===== DOCUMENT =====
    ".pdf",
];
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const isMimeValid = allowedMimeTypes.includes(file.mimetype);
    const isExtValid = allowedExtensions.includes(ext);

    if (isMimeValid && isExtValid) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"), false);
    }
};

// ================= MULTER INSTANCE =================

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
});

// ================= ERROR HANDLER =================

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer specific errors
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size exceeds 100MB limit",
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    // Custom errors (file type etc.)
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "File upload failed",
        });
    }

    next();
};

// ================= EXPORT =================

module.exports = {
    upload,
    handleUploadError,
};
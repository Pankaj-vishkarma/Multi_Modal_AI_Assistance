const asyncHandler = require("../middlewares/async.middleware");
const aiService = require("../services/ai.service");
const videoService = require("../services/video.service");
const audioService = require("../services/audio.service");
const documentService = require("../services/document.service");
const imageService = require("../services/image.service");

/**
 * Image analysis
 */
exports.analyzeImage = asyncHandler(async (req, res) => {
    const { prompt, fileUrl } = req.body;

    const finalPrompt = prompt || "Describe this image in detail";

    const result = await aiService.analyzeImage(fileUrl, finalPrompt);

    res.json({
        success: true,
        data: {
            raw: result
        },
    });
});

/**
 * Video analysis
 */
exports.analyzeVideo = asyncHandler(async (req, res) => {
    const { fileUrl, prompt } = req.body;

    if (!fileUrl) {
        throw new Error("Video file URL is required");
    }

    // ================= DOWNLOAD VIDEO =================
    const localVideoPath = await videoService.downloadVideo(fileUrl);

    if (!localVideoPath) {
        throw new Error("Video download failed");
    }

    // ================= EXTRACT FRAMES =================
    const frames = await videoService.extractFrames(localVideoPath);

    if (!frames || frames.length === 0) {
        throw new Error("No frames extracted from video");
    }

    //  IMPORTANT: normalize frames (ensure string paths)
    const normalizedFrames = frames.map((frame) => String(frame).trim());

    // ================= LIMIT FRAMES =================
    const limitedFrames = normalizedFrames.slice(0, 10);

    console.log("Frames to analyze:", limitedFrames.length);

    // ================= ANALYZE =================
    const analysis = await aiService.analyzeFrames(
        limitedFrames,
        prompt || "Analyze this video in detail"
    );

    // ================= CLEANUP =================
    try {
        await videoService.cleanupFrames(normalizedFrames);
        await videoService.cleanupVideo(localVideoPath);
    } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError.message);
    }

    res.json({
        success: true,
        totalFrames: limitedFrames.length,
        data: analysis,
    });
});

/**
 * Audio analysis
 */
exports.analyzeAudio = asyncHandler(async (req, res) => {
    const { fileUrl } = req.body;

    const result = await audioService.processAudio(fileUrl);

    res.json({
        success: true,
        data: result,
    });
});

/**
 * Document analysis
 */
exports.analyzeDocument = asyncHandler(async (req, res) => {
    const { fileUrl, prompt } = req.body;

    const result = await documentService.processDocument(
        fileUrl,
        prompt
    );

    res.json({
        success: true,
        data: result,
    });
});



exports.compareImages = asyncHandler(async (req, res) => {
    const files = req.files;

    // validation
    if (!files || files.length < 2) {
        return res.status(400).json({
            success: false,
            message: "At least 2 images are required",
        });
    }

    //  IMPORTANT: image validation
    const invalidFile = files.find(
        (file) => !file.mimetype.startsWith("image/")
    );

    if (invalidFile) {
        return res.status(400).json({
            success: false,
            message: "Only image files are allowed for comparison",
        });
    }

    const result = await imageService.compareImages(files);

    res.json({
        success: true,
        data: result,
    });
});
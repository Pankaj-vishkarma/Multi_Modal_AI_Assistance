const asyncHandler = require("../middlewares/async.middleware");
const aiService = require("../services/ai.service");
const videoService = require("../services/video.service");
const audioService = require("../services/audio.service");
const documentService = require("../services/document.service");

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

    const frames = await videoService.extractFrames(fileUrl);
    const limitedFrames = frames.slice(0, 10);

    const analysis = await aiService.analyzeFrames(limitedFrames, prompt);

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
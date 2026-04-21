const asyncHandler = require("../middlewares/async.middleware");
const aiService = require("../services/ai.service");

/**
 * Normal chat (non-stream)
 */
exports.chat = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({
            success: false,
            message: "Message is required",
        });
    }

    const aiResponse = await aiService.generateTextResponse(message);

    res.json({
        success: true,
        message: aiResponse,
    });
});

/**
 * Streaming chat using SSE
 */
exports.streamChat = async (req, res) => {
    const { message, conversationHistory, attachments } = req.body;

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    try {
        let finalPrompt = message || "";

        // HANDLE ATTACHMENTS
        if (attachments && attachments.length > 0) {
            for (let file of attachments) {
                let analysis = "";

                try {
                    if (file.type?.startsWith("image/")) {
                        const result = await aiService.analyzeImage(
                            file.url,
                            "Describe this image"
                        );
                        analysis = result?.result || JSON.stringify(result);
                    }

                    else if (file.type?.startsWith("video/")) {
                        const videoService = require("../services/video.service");

                        // Step 1: Download video
                        const localVideoPath = await videoService.downloadVideo(file.url);

                        // Step 2: Extract frames
                        const frames = await videoService.extractFrames(localVideoPath);

                        // Step 3: Analyze frames
                        const analysisResult = await aiService.analyzeFrames(
                            frames.slice(0, 10),
                            "Analyze this video"
                        );

                        // Step 4: Cleanup (important)
                        try {
                            await videoService.cleanupFrames(frames);
                            await videoService.cleanupVideo(localVideoPath);
                        } catch (err) {
                            console.error("Cleanup failed:", err.message);
                        }

                        analysis = JSON.stringify(analysisResult);
                    }

                    else if (file.type?.startsWith("audio/")) {
                        const result = await aiService.transcribeAudio(file.url);
                        analysis = result?.text || "Audio processed";
                    }

                    else if (file.type === "application/pdf") {
                        const documentService = require("../services/document.service");
                        const result = await documentService.processDocument(
                            file.url,
                            "Summarize this document"
                        );
                        analysis = result?.aiAnalysis || "Document processed";
                    }

                    // Append each analysis to prompt
                    if (analysis) {
                        finalPrompt += `\n\n[File Analysis]: ${analysis}`;
                    }

                } catch (err) {
                    console.error("Attachment processing error:", err.message);
                    finalPrompt += `\n\n[File Error]: Could not process file`;
                }
            }
        }

        // STREAM FINAL AI RESPONSE
        await aiService.streamResponse(finalPrompt, conversationHistory, (chunk) => {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        });

        res.end();

    } catch (error) {
        res.write(
            `data: ${JSON.stringify({ content: "Error: " + error.message })}\n\n`
        );
        res.end();
    }
};
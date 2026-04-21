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
    const { message, conversationHistory } = req.body;

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    try {
        // Stream response
        await aiService.streamResponse(message, conversationHistory, (chunk) => {
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
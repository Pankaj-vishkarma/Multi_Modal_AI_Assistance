const fs = require("fs");
const path = require("path");
const axios = require("axios");
const aiService = require("./ai.service");
const { tempDir } = require("../config/storage");

/**
 * Download audio from URL → local file
 */
const downloadAudio = async (audioUrl, outputPath) => {
    const writer = fs.createWriteStream(outputPath);

    const response = await axios({
        url: audioUrl,
        method: "GET",
        responseType: "stream",
    });

    return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
};

/**
 * Process audio file
 */
exports.processAudio = async (fileUrl) => {
    try {
        const timestamp = Date.now();

        fs.mkdirSync(tempDir, { recursive: true });

        const localAudioPath = path.join(tempDir, `${timestamp}.mp3`);

        // Download audio
        await downloadAudio(fileUrl, localAudioPath);

        // Step 1: Transcribe
        const transcript = await aiService.transcribeAudio(localAudioPath);

        // Step 2: Basic summary (keep simple for now)
        const summary = `Summary:\n${transcript.text}`;

        return {
            transcript: transcript.text,
            summary,
        };

    } catch (error) {
        console.error("Audio processing error:", error.message);
        throw new Error("Audio processing failed");
    }
};

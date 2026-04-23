const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { tempDir, framesDir } = require("../config/storage");

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Download video
 */
exports.downloadVideo = async (videoUrl) => {
    const timestamp = Date.now();

    fs.mkdirSync(tempDir, { recursive: true });

    const outputPath = path.join(tempDir, `${timestamp}.mp4`);

    const writer = fs.createWriteStream(outputPath);

    const response = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream",
    });

    return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on("finish", () => resolve(outputPath));
        writer.on("error", reject);
    });
};

/**
 * Extract frames
 */
exports.extractFrames = async (localVideoPath) => {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();

        const frameDir = path.join(
            framesDir,
            timestamp.toString()
        );

        fs.mkdirSync(frameDir, { recursive: true });

        ffmpeg(localVideoPath)
            .outputOptions(["-vf fps=1"])
            .output(path.join(frameDir, "frame-%03d.jpg"))
            .on("end", () => {
                let files = fs.readdirSync(frameDir);

                // sort frames properly
                files = files.sort();

                const framePaths = files.map((file) =>
                    path.join(frameDir, file)
                );

                resolve(framePaths);
            })
            .on("error", (err) => {
                console.error("FFmpeg error:", err.message);
                reject(err);
            })
            .run();
    });
};

/**
 * Cleanup frames
 */
exports.cleanupFrames = async (framePaths) => {
    try {
        if (!framePaths || framePaths.length === 0) return;

        const dir = path.dirname(framePaths[0]);

        fs.rmSync(dir, { recursive: true, force: true });
    } catch (err) {
        console.error("Cleanup frames error:", err.message);
    }
};

/**
 * Cleanup video
 */
exports.cleanupVideo = async (videoPath) => {
    try {
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
        }
    } catch (err) {
        console.error("Cleanup video error:", err.message);
    }
};

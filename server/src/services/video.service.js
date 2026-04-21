const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Download video from URL → local path
 */
const downloadVideo = async (videoUrl, outputPath) => {
    const writer = fs.createWriteStream(outputPath);

    const response = await axios({
        url: videoUrl,
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
 * Extract frames from video
 */
exports.extractFrames = async (videoUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            const timestamp = Date.now();

            const tempDir = path.join(process.cwd(), "src/storage/temp");
            const frameDir = path.join(process.cwd(), "src/storage/frames", timestamp.toString());

            fs.mkdirSync(tempDir, { recursive: true });
            fs.mkdirSync(frameDir, { recursive: true });

            // 📥 download video
            const localVideoPath = path.join(tempDir, `${timestamp}.mp4`);
            await downloadVideo(videoUrl, localVideoPath);

            const framePaths = [];

            ffmpeg(localVideoPath)
                .outputOptions(["-vf fps=1"])
                .output(path.join(frameDir, "frame-%03d.jpg"))
                .on("end", () => {
                    const files = fs.readdirSync(frameDir);

                    files.forEach((file) => {
                        const fullPath = path.join(frameDir, file);

                        // convert to URL
                        const url = `${process.env.BASE_URL || "http://localhost:5000"}/${fullPath.replace(/\\/g, "/")}`;

                        framePaths.push(url);
                    });

                    resolve(framePaths);
                })
                .on("error", (err) => {
                    console.error("FFmpeg error:", err.message);
                    reject(err);
                })
                .run();
        } catch (error) {
            reject(error);
        }
    });
};
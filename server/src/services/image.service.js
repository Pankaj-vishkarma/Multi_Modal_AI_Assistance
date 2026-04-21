const sharp = require("sharp");
const path = require("path");
const aiService = require("./ai.service");
const fs = require("fs");

/**
 * Generate thumbnail
 */
exports.generateThumbnail = async (filePath) => {
    const outputPath = filePath.replace("uploads", "thumbnails");

    await sharp(filePath)
        .resize(300)
        .toFile(outputPath);

    return outputPath;
};


// IMAGE COMPARISON (PRODUCTION READY)
exports.compareImages = async (files) => {
    try {
        // Safety: limit images
        if (files.length > 5) {
            throw new Error("Maximum 5 images allowed");
        }

        // 1. Analyze each image (safe parallel)
        const results = await Promise.all(
            files.map(async (file, index) => {
                try {
                    const filePath = file.path;

                    const res = await aiService.analyzeImage(
                        filePath,
                        `Analyze Image ${index + 1} in detail`
                    );

                    const text = res?.result || "No analysis";

                    // Limit text size (prevent AI crash)
                    const trimmedText =
                        text.length > 500
                            ? text.substring(0, 500) + "..."
                            : text;

                    return {
                        filename: file.originalname,
                        analysis: trimmedText,
                    };

                } catch (err) {
                    console.error(`Image ${index + 1} failed:`, err.message);

                    return {
                        filename: file.originalname,
                        analysis: "Analysis failed",
                    };
                }
            })
        );

        // 2. Combine all analysis
        const combinedAnalysis = results
            .map(
                (img, i) =>
                    `Image ${i + 1} (${img.filename}):\n${img.analysis}`
            )
            .join("\n\n");

        // 3. Comparison prompt
        const comparisonPrompt = `
You are an expert AI image comparison assistant.

You are given detailed analysis of multiple images.

${combinedAnalysis}

Now compare them and provide:

1. Similarities (common things)
2. Differences (unique per image)
3. Final Summary

Keep response clean and structured.
`;

        // 4. AI comparison (safe fallback)
        let comparison = "Unable to compare images right now.";

        try {
            const aiRes = await aiService.generateTextResponse(
                comparisonPrompt
            );

            if (aiRes) {
                comparison = aiRes;
            }
        } catch (err) {
            console.error("Comparison AI failed:", err.message);
        }

        return {
            images: results,
            comparison,
        };

    } catch (error) {
        console.error("Image comparison failed:", error.message);
        throw error;
    } finally {
        // CLEANUP FILES 
        files.forEach((file) => {
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error(
                        "File delete failed:",
                        err.message
                    );
                }
            });
        });
    }
};
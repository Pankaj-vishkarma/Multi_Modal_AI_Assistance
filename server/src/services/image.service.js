const sharp = require("sharp");
const path = require("path");

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
const fs = require("fs");
const path = require("path");

/**
 * Delete files older than 24h
 */
exports.cleanupOldFiles = () => {
    const dir = "src/storage/uploads";

    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        const age = Date.now() - stats.mtimeMs;

        if (age > 24 * 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
        }
    });
};
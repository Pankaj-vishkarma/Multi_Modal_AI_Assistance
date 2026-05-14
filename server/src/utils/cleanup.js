const fs = require("fs");
const path = require("path");
const { uploadsDir } = require("../config/storage");

/**
 * Delete files older than 24h
 */
exports.cleanupOldFiles = () => {
    const dir = uploadsDir;

    if (!fs.existsSync(dir)) {
        return;
    }

    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        const age = Date.now() - stats.mtimeMs;

        if (age > 24 * 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
        }
    });
};

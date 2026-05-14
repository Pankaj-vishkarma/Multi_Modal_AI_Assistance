const FileType = require("file-type");
const fs = require("fs");

/**
 * Validate file using magic bytes (not extension)
 */
exports.validateFile = async (filePath, allowedTypes) => {
    const buffer = fs.readFileSync(filePath);

    const type = await FileType.fromBuffer(buffer);

    if (!type || !allowedTypes.includes(type.mime)) {
        throw new Error("Invalid file type");
    }

    return type;
};
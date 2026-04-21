const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const aiService = require("./ai.service");

/**
 * Download PDF from URL → local path
 */
const downloadFile = async (fileUrl, outputPath) => {
    const writer = fs.createWriteStream(outputPath);

    const response = await axios({
        url: fileUrl,
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
 * Extract text from PDF
 */
const extractPDFText = async (filePath) => {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
};

/**
 * Process document
 */
exports.processDocument = async (fileUrl, prompt) => {
    try {
        const timestamp = Date.now();

        const tempDir = path.join(process.cwd(), "src/storage/temp");
        fs.mkdirSync(tempDir, { recursive: true });

        const localPath = path.join(tempDir, `${timestamp}.pdf`);

        // Download PDF
        await downloadFile(fileUrl, localPath);

        // Extract text
        const text = await extractPDFText(localPath);

        if (!text || !text.trim()) {
            throw new Error("No text found in document");
        }

        // Limit text size
        const limitedText = text.slice(0, 5000);

        //  AI Analysis
        const response = await aiService.analyzeText(
            limitedText,
            prompt || "Summarize this document"
        );

        return {
            extractedText: limitedText,
            aiAnalysis: response,
        };

    } catch (error) {
        console.error("Document processing error:", error.message);
        throw new Error("Document processing failed");
    }
};
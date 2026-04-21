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
    const data = await  pdfParse(buffer);
    return data.text;
};

/**
 * Process document
 */
exports.processDocument = async (fileUrl, prompt) => {
    const timestamp = Date.now();

    const tempDir = path.join(process.cwd(), "src/storage/temp");
    fs.mkdirSync(tempDir, { recursive: true });

    const localPath = path.join(tempDir, `${timestamp}.pdf`);

    try {
        // Download PDF
        await downloadFile(fileUrl, localPath);

        // Extract text
        const text = await extractPDFText(localPath);

        if (!text || !text.trim()) {
            throw new Error("No text found in document");
        }

        const limitedText = text.slice(0, 5000);

        const response = await aiService.analyzeText(
            limitedText,
            prompt || "Summarize this document"
        );

        return {
            extractedText: limitedText,
            aiAnalysis: response?.result || "No analysis",
        };

    } catch (error) {
        console.error("Document processing error:", error.message);
        throw new Error("Document processing failed");
    } finally {
        // CLEANUP
        if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
        }
    }
};
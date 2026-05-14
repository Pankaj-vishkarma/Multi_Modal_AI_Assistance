const Tesseract = require("tesseract.js");

exports.extractTextFromImage = async (imagePath) => {
    try {
        const { data } = await Tesseract.recognize(
            imagePath,
            "eng+hin",
            {
                logger: (m) => {
                    if (m.status === "recognizing text") {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                },
            }
        );

        return data.text.trim();
    } catch (error) {
        console.error("OCR Error:", error.message);
        return "";
    }
};
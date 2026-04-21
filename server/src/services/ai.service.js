const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

/**
 * Convert file URL → base64
 */
const getBase64FromUrl = async (url) => {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data).toString("base64");
};

/**
 * Analyze image using Gemini (FIXED)
 */
exports.analyzeImage = async (fileUrl, prompt) => {
    try {
        // Step 1: Send image to HuggingFace
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
            {
                inputs: fileUrl, // HF supports URL directly
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const caption = response.data?.[0]?.generated_text;

        if (!caption) {
            throw new Error("No caption generated");
        }

        // Step 2: Combine with prompt (important for your project)
        const finalText = `${prompt}\n\nImage Description: ${caption}`;

        // Step 3: Return same structure (frontend safe)
        return {
            success: true,
            result: finalText,
        };

    } catch (error) {
        console.error(
            "HF Image Error:",
            error.response?.data || error.message
        );

        return {
            success: false,
            result: "⚠️ Image analysis failed",
        };
    }
};

/**
 * Analyze frames (video)
 */
exports.analyzeFrames = async (frameUrls, prompt) => {
    const results = [];

    for (let i = 0; i < frameUrls.length; i++) {
        const res = await exports.analyzeImage(
            frameUrls[i],
            `Frame ${i + 1}: ${prompt}`
        );

        results.push({
            frame: frameUrls[i],
            analysis: res,
        });
    }

    return results;
};

/**
 * Transcribe audio using Whisper
 */
exports.transcribeAudio = async (filePath) => {
    try {
        const audioBuffer = fs.readFileSync(filePath);

        const response = await axios.post(
            "https://api-inference.huggingface.co/models/openai/whisper-base",
            audioBuffer,
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "audio/mpeg",
                },
            }
        );

        return {
            success: true,
            text: response.data.text,
        };

    } catch (error) {
        console.error("HF Whisper Error:", error.response?.data || error.message);

        return {
            success: false,
            text: "⚠️ Audio transcription failed",
        };
    }
};

/**
 * Simulated streaming response
 */
exports.streamResponse = async (prompt, conversationHistory, onData) => {
    const MODELS = [
        "llama-3.1-8b-instant",
        "llama-3.1-70b-versatile",
        "mixtral-8x7b-32768"
    ];

    for (let model of MODELS) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model,
                    messages: [{ role: "user", content: prompt }],
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const text = response.data.choices[0].message.content;

            const words = text.split(" ");

            for (let i = 0; i < words.length; i++) {
                await new Promise(res => setTimeout(res, 30));
                onData(words[i] + " ");
            }

            return;

        } catch (error) {
            console.error(`Model ${model} failed`, error.response?.data || error.message);
        }
    }

    onData("⚠️ All AI models failed");
};
/**
 * Analyze text using Gemini
 */
exports.analyzeText = async (text, prompt) => {
    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-70b-8192",
                messages: [
                    {
                        role: "user",
                        content: `${prompt}\n\n${text}`
                    }
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return {
            success: true,
            result: response.data.choices[0].message.content,
        };

    } catch (error) {
        console.error("Groq Text Error:", error.response?.data || error.message);

        return {
            success: false,
            result: "⚠️ Text analysis failed",
        };
    }
};

/**
 * Generate text response using Gemini
 */
exports.generateTextResponse = async (prompt) => {
    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-70b-8192",
                messages: [
                    { role: "user", content: prompt }
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {
        console.error("Groq Chat Error:", error.response?.data || error.message);
        throw new Error("Chat generation failed");
    }
};
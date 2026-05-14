const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { extractTextFromImage } = require("../utils/ocr.util");
const https = require("https");
const { resolveUploadPathFromUrl } = require("../config/storage");

/**
 * Convert file URL → base64
 */
const getBase64FromUrl = async (url) => {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data).toString("base64");
};

const callGroqWithFallback = async (messages) => {
    const MODELS = [
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768"
    ];

    for (let model of MODELS) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model,
                    messages,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data.choices[0].message.content;

        } catch (error) {
            console.error(`Model ${model} failed:`, error.response?.data || error.message);
        }
    }

    throw new Error("All AI models failed");
};

/**
 * Analyze image using Gemini (FIXED)
 */

exports.analyzeImage = async (fileUrl, prompt) => {
    try {
        console.log("===== IMAGE ANALYSIS START =====");
        console.log("FILE URL:", fileUrl);

        // ================= STEP 1: READ IMAGE FROM DISK =================
        console.log("Reading image from local storage...");

        const fullPath = resolveUploadPathFromUrl(fileUrl);

        console.log("Resolved file path:", fullPath);

        if (!fs.existsSync(fullPath)) {
            throw new Error("File not found on server");
        }

        const imageBuffer = fs.readFileSync(fullPath);

        console.log("Image read successfully from disk");

        // ================= STEP 2: OCR (MOST IMPORTANT) =================
        console.log("Running OCR...");

        let extractedText = "";

        try {
            extractedText = await extractTextFromImage(fullPath);
            console.log("OCR TEXT:", extractedText);
        } catch (ocrError) {
            console.error("OCR FAILED:", ocrError.message);
        }

        // ================= STEP 3: TRY HUGGINGFACE =================
        let caption = null;

        try {
            console.log("Calling HuggingFace...");

            delete process.env.HTTP_PROXY;
            delete process.env.HTTPS_PROXY;

            const options = {
                hostname: "api-inference.huggingface.co",
                path: "/models/Salesforce/blip-image-captioning-base",
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "application/octet-stream",
                    "Content-Length": imageBuffer.length,
                },
            };

            const data = await new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let body = "";

                    console.log("HF STATUS:", res.statusCode);

                    res.on("data", (chunk) => {
                        body += chunk;
                    });

                    res.on("end", () => {
                        try {
                            const parsed = JSON.parse(body);
                            resolve(parsed);
                        } catch (err) {
                            console.error("HF RAW RESPONSE:", body);
                            reject(new Error("Invalid JSON from HF"));
                        }
                    });
                });

                req.on("error", reject);
                req.write(imageBuffer);
                req.end();
            });

            console.log("HF RESPONSE:", data);

            if (Array.isArray(data)) {
                caption = data[0]?.generated_text;
            } else if (data?.generated_text) {
                caption = data.generated_text;
            }

            console.log("HF Caption:", caption);

        } catch (hfError) {
            console.error("HF FAILED:", hfError.message);
        }

        // ================= STEP 4: SMART FALLBACK =================
        if (!caption) {
            console.log("Using fallback caption...");
            caption = "This image may contain objects, people, scenes or visual elements.";
        }

        // ================= STEP 5: COMBINE TEXT =================
        let combinedText = "";

        if (extractedText && extractedText.trim().length > 10) {
            combinedText = `
Image Description:
${caption}

Detected Text in Image:
${extractedText}
`;
        } else {
            combinedText = `
Image Description:
${caption}

No readable text found in image.
`;
        }

        console.log("FINAL TEXT SENT TO AI:", combinedText);

        // ================= STEP 6: GROQ ANALYSIS =================
        let enhancedText = combinedText;

        try {
            console.log("Enhancing with Groq...");

            const aiResponse = await callGroqWithFallback([
                {
                    role: "user",
                    content: `${prompt || "Analyze this image in detail"}:\n${combinedText}`,
                },
            ]);

            if (aiResponse) {
                enhancedText = aiResponse;
            }

        } catch (err) {
            console.error("Groq failed:", err.message);
        }

        console.log("===== IMAGE ANALYSIS SUCCESS =====");

        return {
            success: true,
            result: enhancedText,
        };

    } catch (error) {
        console.error("===== IMAGE ANALYSIS FAILED =====");
        console.error("FINAL ERROR:", error.message);

        return {
            success: false,
            result: "Unable to analyze image right now. Please try again.",
        };
    }
};

/**
 * Analyze frames (video)
 */
exports.analyzeFrames = async (frameUrls, prompt) => {
    const results = [];
    const captions = [];

    // ================= SAFETY: EMPTY INPUT =================
    if (!frameUrls || frameUrls.length === 0) {
        return {
            frames: [],
            summary: "No frames available for analysis",
        };
    }

    // ================= LIMIT FRAMES =================
    const safeFrames = frameUrls.slice(0, 10);

    for (let i = 0; i < safeFrames.length; i++) {
        try {
            let frameUrl = safeFrames[i];

            //  FIX: normalize path
            if (typeof frameUrl === "string") {
                frameUrl = frameUrl.trim();
            }

            console.log(`Processing Frame ${i + 1}:`, frameUrl);

            const res = await exports.analyzeImage(
                frameUrl,
                `Frame ${i + 1}: ${prompt || "Analyze this frame carefully. Text may be in Hindi or English."}`
            );

            const text =
                res && res.success && res.result
                    ? res.result
                    : "No meaningful analysis";

            results.push({
                frame: frameUrl,
                analysis: text,
            });

            //  LIMIT SIZE (prevent Groq crash)
            const trimmedText =
                text.length > 300 ? text.substring(0, 300) + "..." : text;

            captions.push(`Frame ${i + 1}: ${trimmedText}`);

        } catch (err) {
            console.error(`Frame ${i + 1} failed:`, err.message);

            results.push({
                frame: safeFrames[i],
                analysis: "Analysis failed",
            });
        }
    }

    // ================= FINAL VIDEO SUMMARY =================
    let finalSummary = "";

    try {
        if (!captions.length) {
            throw new Error("No valid frame data");
        }

        const combinedCaptions = captions.join("\n");

        console.log("Sending frames to Groq for summary...");

        // FIX: direct function call 
        finalSummary = await callGroqWithFallback([
            {
                role: "user",
                content: `
Analyze this video based on multiple frames.

Frame details:
${combinedCaptions}

Instructions:
- Explain what is happening in the video
- Extract and include any visible text (Hindi or English)
- Keep the explanation clear and structured
                `,
            },
        ]);

        if (!finalSummary || typeof finalSummary !== "string") {
            finalSummary = "Video analyzed but no detailed summary generated.";
        }

    } catch (err) {
        console.error("Final summary failed:", err.message);

        // SAFE FALLBACK
        finalSummary = captions.length
            ? `Video contains ${captions.length} frames. Key observations:\n${captions
                .slice(0, 3)
                .join("\n")}`
            : "Unable to analyze video";
    }

    return {
        frames: results,
        summary: finalSummary,
    };
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
            text: " Audio transcription failed",
        };
    }
};

/**
 * Simulated streaming response
 */
exports.streamResponse = async (prompt, conversationHistory = [], onData) => {
    const MODELS = [
        "llama-3.1-8b-instant",   // primary (fast + free)
        "mixtral-8x7b-32768"     // fallback
    ];

    // build messages with history (important for chat context)
    const messages = [
        ...(conversationHistory || []),
        { role: "user", content: prompt }
    ];

    for (let model of MODELS) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model,
                    messages,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 15000, // prevent hanging
                }
            );

            const text = response?.data?.choices?.[0]?.message?.content;

            // safety check
            if (!text) {
                throw new Error("Empty response from AI");
            }

            const words = text.split(" ");

            // smooth streaming
            for (let i = 0; i < words.length; i++) {
                await new Promise(res => setTimeout(res, 25));
                onData(words[i] + " ");
            }

            return; // stop after success

        } catch (error) {
            console.error(
                `Model ${model} failed:`,
                error.response?.data || error.message
            );
        }
    }

    // FINAL FALLBACK (no crash)
    onData(" AI is busy right now. Please try again.");
};
/**
 * Analyze text using Gemini
 */
exports.analyzeText = async (text, prompt) => {
    const MODELS = [
        "llama-3.1-8b-instant",   //  primary (free + fast)
        "mixtral-8x7b-32768"     //  fallback
    ];

    for (let model of MODELS) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model,
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
            console.error(
                `Model ${model} failed:`,
                error.response?.data || error.message
            );
        }
    }

    //  FINAL FALLBACK (no crash)
    return {
        success: false,
        result: " AI is busy right now. Please try again.",
    };
};

/**
 * Generate text response using Gemini
 */
exports.generateTextResponse = async (prompt) => {
    const MODELS = [
        "llama-3.1-8b-instant",   // primary (fast + free)
        "mixtral-8x7b-32768"     // fallback
    ];

    for (let model of MODELS) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model,
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
            console.error(
                `Model ${model} failed:`,
                error.response?.data || error.message
            );
        }
    }

    // FINAL SAFE FALLBACK (no crash)
    return " AI is currently unavailable. Please try again.";
};

import axios from "axios";

// ================= BASE CONFIG =================

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= INTERCEPTORS =================

// Response interceptor (global error handling)
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message || error.message || "Something went wrong";

    console.error("API Error:", message);

    return Promise.reject(new Error(message));
  }
);

// ================= CHAT =================

export const sendChatMessage = async (message, conversationHistory) => {
  return await API.post("/chat", {
    message,
    conversationHistory,
  });
};

// ================= STREAM CHAT =================

export const streamChatMessage = async (message, conversationHistory, onChunk) => {
  try {
    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error("Streaming request failed");
    }

    if (!response.body) {
      throw new Error("Streaming not supported by this browser");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (value) {
        const chunk = decoder.decode(value);
        onChunk(chunk);
      }
    }
  } catch (error) {
    console.error("Streaming error:", error.message);
    throw error;
  }
};

// ================= UPLOAD =================

export const uploadMedia = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  return await API.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percent);
      }
    },
  });
};

// ================= ANALYZE =================

export const analyzeMedia = async (fileUrl, fileType) => {
  return await API.post(`/analyze/${fileType}`, {
    fileUrl,
  });
};

// ================= HEALTH CHECK =================

export const checkBackendHealth = async () => {
  return await API.get("/health");
};
import axios from "axios";

// ================= BASE CONFIG =================

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

export const normalizeMediaUrl = (url) => {
  if (!url || typeof url !== "string") return url;

  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  if (url.startsWith("/uploads/") || url.startsWith("/storage/")) {
    return `${API_ORIGIN}${url}`;
  }

  if (url.startsWith("uploads/") || url.startsWith("storage/")) {
    return `${API_ORIGIN}/${url}`;
  }

  return url;
};

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete config.headers["Content-Type"];
    }
  }

  return config;
});

// ================= INTERCEPTORS =================

// Response interceptor (global error handling)
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message || error.message || "Something went wrong";

    console.error("API Error:", error?.response || message);

    // keep throwing
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

export const streamChatMessage = async (
  message,
  conversationHistory,
  attachments = [],
  onChunk
) => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        attachments,
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
    let buffer = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const parts = buffer.split("\n\n");
        buffer = parts.pop();

        for (let part of parts) {
          part = part.trim();

          if (!part.startsWith("data:")) continue;

          const jsonStr = part.replace("data:", "").trim();

          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed?.content) {
              onChunk(parsed.content);
            }
          } catch { }
        }
      }
    }

    // IMPORTANT: process remaining buffer
    if (buffer.trim().startsWith("data:")) {
      try {
        const jsonStr = buffer.replace("data:", "").trim();
        const parsed = JSON.parse(jsonStr);

        if (parsed?.content) {
          onChunk(parsed.content);
        }
      } catch { }
    }

  } catch (error) {
    console.error("Streaming error:", error.message);
    onChunk(" Error: " + error.message);
    return null;
  }
};

// ================= UPLOAD =================

export const uploadMedia = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  return await API.post("/upload", formData, {
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

// ================= IMAGE COMPARISON =================

export const compareImagesAPI = async (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  try {
    const response = await API.post("/analyze/compare-images", formData);

    return response;
  } catch (error) {
    console.error("Compare Images API Error:", error.message);
    throw error;
  }
};

export const getChatHistory = async () => {
  return await API.get("/chat/history");
};


// ================= HEALTH CHECK =================

export const checkBackendHealth = async () => {
  return await API.get("/health");
};




const path = require("path");

const storageRoot = path.resolve(__dirname, "..", "storage");
const uploadsDir = path.join(storageRoot, "uploads");
const tempDir = path.join(storageRoot, "temp");
const framesDir = path.join(storageRoot, "frames");

const getBaseUrl = (req) => {
    const configuredBaseUrl = process.env.BASE_URL;

    if (configuredBaseUrl) {
        return configuredBaseUrl.replace(/\/$/, "");
    }

    if (req) {
        return `${req.protocol}://${req.get("host")}`;
    }

    return "http://localhost:5000";
};

const toPublicUploadUrl = (filename, req) => {
    return `${getBaseUrl(req)}/uploads/${encodeURIComponent(filename)}`;
};

const resolveUploadPathFromUrl = (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== "string") {
        return fileUrl;
    }

    const normalizedUrl = fileUrl.trim();

    if (path.isAbsolute(normalizedUrl)) {
        return normalizedUrl;
    }

    try {
        const url = new URL(normalizedUrl, getBaseUrl());
        const pathname = decodeURIComponent(url.pathname);

        if (pathname.startsWith("/uploads/")) {
            return path.join(uploadsDir, path.basename(pathname));
        }

        if (pathname.startsWith("/storage/uploads/")) {
            return path.join(uploadsDir, path.basename(pathname));
        }
    } catch {
        // Fall through to relative-path handling below.
    }

    const cleanPath = normalizedUrl.replace(/\\/g, "/");

    if (cleanPath.startsWith("/uploads/") || cleanPath.startsWith("uploads/")) {
        return path.join(uploadsDir, path.basename(cleanPath));
    }

    if (
        cleanPath.startsWith("/storage/uploads/") ||
        cleanPath.startsWith("storage/uploads/") ||
        cleanPath.startsWith("src/storage/uploads/")
    ) {
        return path.join(uploadsDir, path.basename(cleanPath));
    }

    return normalizedUrl;
};

module.exports = {
    storageRoot,
    uploadsDir,
    tempDir,
    framesDir,
    getBaseUrl,
    toPublicUploadUrl,
    resolveUploadPathFromUrl,
};

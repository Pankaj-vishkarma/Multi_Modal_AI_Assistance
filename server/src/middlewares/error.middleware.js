const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
    // default values
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // ================= LOG FULL ERROR =================
    logger.error(`[ERROR] ${message}`);
    logger.error(err.stack);

    // ================= MONGOOSE DUPLICATE KEY ERROR =================
    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }

    // ================= MONGOOSE VALIDATION ERROR =================
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }

    // ================= JWT ERROR =================
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // ================= FINAL RESPONSE =================
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
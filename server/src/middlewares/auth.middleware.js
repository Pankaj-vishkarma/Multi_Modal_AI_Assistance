const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // No header
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing",
            });
        }

        // Invalid format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing",
            });
        }

        // Ensure secret exists
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET not defined in environment");
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attach user to request
        req.user = decoded;

        next();

    } catch (error) {
        console.error("Auth error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token",
        });
    }
};
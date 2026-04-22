const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");
const logger = require("./utils/logger");

dotenv.config();

const app = express();

// ================= SECURITY =================

// Trust proxy (important for deployment e.g. Vercel, Render)
app.set("trust proxy", 1);

// Helmet (secure headers)
app.use(helmet());

// ================= RATE LIMIT =================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, // limit each IP
    message: {
        success: false,
        message: "Too many requests, please try again later",
    },
});

app.use(limiter);

// ================= CORS =================

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    })
);

// ================= BODY PARSING =================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================= COMPRESSION =================

app.use(compression());

// ================= STATIC FILES =================

app.use(
    "/storage",
    (req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
    },
    express.static("src/storage")
);

// ================= LOGGER =================

app.use((req, res, next) => {
    logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ================= HEALTH CHECK =================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date(),
    });
});

// ================= ROUTES =================

app.use("/api", routes);

// ================= 404 =================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// ================= ERROR HANDLER =================

app.use(errorMiddleware);

module.exports = app;
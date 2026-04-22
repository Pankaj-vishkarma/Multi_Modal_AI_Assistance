const app = require("./app");
const mongoose = require("mongoose");
const { connectDB } = require("./config/db");
const logger = require("./utils/logger");
const { cleanupOldFiles } = require("./utils/cleanup");

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
    logger.error("MONGO_URI not defined in environment");
    process.exit(1);
}

// cleanup job
setInterval(async () => {
    try {
        await cleanupOldFiles();
        logger.info("Cleanup job executed");
    } catch (error) {
        logger.error("Cleanup job failed", error);
    }
}, 60 * 60 * 1000);

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, "0.0.0.0", () => {
            logger.info(`Server running at http://0.0.0.0:${PORT}`);
        });
    } catch (error) {
        logger.error(`Server start failed: ${error.message}`, {
            stack: error.stack,
        });
        process.exit(1);
    }
};

// graceful shutdown
process.on("SIGINT", async () => {
    logger.info("Shutting down server...");

    try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
        process.exit(0);
    } catch (error) {
        logger.error("Error during shutdown", error);
        process.exit(1);
    }
});

startServer();
import pino from "pino";
import path from "path";
import fs from "fs";
import PinoRotate from "pino-daily-rotate-file";

// Ensure log folder exists
const logDir = path.resolve("logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Configure log rotation
const transport = PinoRotate({
  filename: path.join(logDir, "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "14d", // keep logs for 14 days
});

const logger = pino(
  {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: null,
  },
  transport
);

export default logger;

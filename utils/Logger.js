// utils/Logger.js
import pino from "pino";
import fs from "fs";
import path from "path";

// Ensure log folder exists
const logDir = path.resolve("logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "app.log");

// Simple logger setup — NO rotation, NO crash
const transport = pino.transport({
  targets: [
    {
      target: "pino/file",
      options: { destination: logFile, mkdir: true },
      level: "info",
    },
    {
      target: "pino-pretty",
      options: { colorize: true },
      level: "debug",
    },
  ],
});

const logger = pino(
  {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);

export default logger;

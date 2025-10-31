import logger from "../utils/Logger.js";

export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  console.error(err.stack);

  if (statusCode >= 500) {
    logger.fatal({
      message: err.message,
      stack: err.stack,
      statusCode: statusCode,
      data: err.data || null,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    data: err.data || null,
  });
}

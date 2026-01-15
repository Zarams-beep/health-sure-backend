import express from "express";
import cors from "cors";
import { connectDB, sequelize } from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import healthEditRoutes from "./routes/healthEditRoutes.js";
import config from "./config/index.js";

const app = express();

// CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://health-sure-nine.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use('/uploads', express.static('uploads'));

// Root route FIRST
app.get("/", (req, res) => {
  res.json({ 
    message: "HealthSure Backend Running with PostgreSQL",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Then your API routes
app.use("/auth", authRoutes);
app.use("/dashboard/:userId/manage-health", healthEditRoutes);
app.use("/", chatRoutes);

// 404 handler comes LAST (catches everything that didn't match above)
app.use((req, res, next) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path 
  });
});

// Error handler comes AFTER 404
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  
  // Use the error's status code if available, otherwise 500
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  
  res.status(statusCode).json({ 
    success: false,
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// DB Connection
connectDB();
sequelize
  .sync({ alter: true })
  .then(() => console.log("Tables synchronized"))
  .catch((err) => console.error("Error syncing tables:", err));

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Server
const PORT = config.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
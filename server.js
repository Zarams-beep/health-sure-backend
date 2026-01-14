import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
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

app.use(cors(corsOptions));

// Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(join(__dirname, "uploads")));

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
  res.status(500).json({ error: "Internal server error" });
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
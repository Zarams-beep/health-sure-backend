import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { connectDB, sequelize } from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import healthEditRoutes from "./routes/healthEditRoutes.js";
// Setup environment
dotenv.config();

const app = express();

// In server.js - Update CORS config Cross-Origin Resource Sharing
// This makes sure only your frontend apps (localhost:3000 during dev, and your deployed Vercel site) can talk to the backend.
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://health-sure-nine.vercel.app'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply to all routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight

// Directory setup
// Because ES modules don’t have __dirname by default, this helps figure out the current folder path.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware = functions that run before your routes (like body parsing, file serving, etc.).
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/dashboard/:userId/manage-health", healthEditRoutes);
app.use("/",chatRoutes)

// DB Connection
connectDB();
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ Tables synchronized"))
  .catch((err) => console.error("❌ Error syncing tables:", err));

// Error Handlers
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Root route
app.get("/", (req, res) => {
  res.send("HealthSure Backend Running with PostgreSQL");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { connectDB, sequelize } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import healthEditRoutes from "./routes/healthEditRoutes.js";

// Setup environment
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://health-sure-nine.vercel.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/:userId/manage-health", healthEditRoutes);

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

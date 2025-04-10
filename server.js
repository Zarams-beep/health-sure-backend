import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { connectDB, sequelize } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import healthEditRoutes from './routes/healthEditRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

// 🔥 CORS FIX - Add this configuration
const corsOptions = {
  origin: ['http://localhost:3000'], // Add your frontend URLs
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions)); // Changed this line

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use("/auth", authRoutes);

// 🔥 ROUTE FIX - Add /users prefix
app.use("/users/:userId/manage-health", healthEditRoutes); // Changed this line

connectDB();
sequelize.sync({ alter: true })
    .then(() => console.log("Tables synchronized"))
    .catch((err) => console.error("Error syncing tables:", err));

// 🔥 ERROR HANDLING - Add these at the end
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.get("/", (req, res) => {
    res.send("HealthSure Backend Running with PostgreSQL");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
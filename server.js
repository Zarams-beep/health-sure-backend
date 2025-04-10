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

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use("/auth", authRoutes);
app.use("/:userId/manage-health", healthEditRoutes);

connectDB();
sequelize.sync({ alter: true })
    .then(() => console.log("Tables synchronized"))
    .catch((err) => console.error("Error syncing tables:", err));

app.get("/", (req, res) => {
    res.send("HealthSure Backend Running with PostgreSQL");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

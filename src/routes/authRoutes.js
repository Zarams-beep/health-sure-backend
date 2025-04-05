import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/user.js"; // Verified correct path

// Configuration for file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_PATH = path.join(process.cwd(), 'uploads'); // Production-safe path

// Debugging logs
console.log("Current directory:", process.cwd());
console.log("Uploads path:", UPLOADS_PATH);

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed (JPEG/PNG)"), false);
    }
  },
});

// Enhanced error handling middleware
const handleErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(500).json({ message: "Server error" });
  }
  next();
};

// User Signup Route
router.post("/sign-up", 
  upload.single("image"),
  handleErrors,
  async (req, res) => {
    const { fullName, email, password } = req.body;
    
    try {
      // Validation
      if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "All fields are required" });
      }

      // Existing user check
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(409).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await User.create({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        image: req.file?.filename || null,
      });

      // Generate JWT
      const token = jwt.sign(
        { id: newUser.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: "1h" }
      );

      // Response
      res.status(201).json({
        message: "Signup successful",
        token,
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          image: req.file ? `/uploads/${req.file.filename}` : null
        }
      });

    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("Signup Error:", error);
      res.status(500).json({
        message: "Server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
);

// User Login Route
router.post("/log-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        image: user.image ? `/uploads/${user.image}` : null
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

export default router;
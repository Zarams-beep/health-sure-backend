import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import User from "../models/user.js";
import fs from "fs";
import { fileURLToPath } from "url";

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

// Serve uploaded images as static files
router.use("/uploads", express.static(uploadsDir));

// Improved Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g. "123456789-abcd.jpg"
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

// ✅ Improved User Signup Route
router.post("/sign-up", upload.single("image"), async (req, res) => {
  const { fullName, email, password } = req.body;
  
  try {
    // Validate required fields
    if (!fullName || !email || !password) {
      // Cleanup uploaded file if validation fails
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists (with automatic file cleanup)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password with stronger cost factor
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (store filename only)
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      image: req.file ? req.file.filename : null, // Store filename only
    });

    // Generate token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { 
      expiresIn: "1h" 
    });

    // Return sanitized user data with constructed URL
    const userResponse = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      image: req.file ? `/uploads/${req.file.filename}` : null // Construct URL here
    };

    res.status(201).json({ 
      message: "Signup successful", 
      token,
      user: userResponse 
    });

  } catch (error) {
    // Cleanup uploaded file on any error
    if (req.file) fs.unlinkSync(req.file.path);
    
    console.error("Signup Error:", error);
    res.status(500).json({ 
      message: "Server error during signup",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// ✅ User Login Route (unchanged, already good)
router.post("/log-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

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
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

export default router;
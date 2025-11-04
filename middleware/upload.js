import multer from "multer";
import path from "path";
import fs from "fs";

// Helper function to ensure folder exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Define base directories using process.cwd()
const tempDir = path.join(process.cwd(), "uploads/temp");
const uploadsDir = path.join(process.cwd(), "uploads");

// Make sure both folders exist
ensureDir(tempDir);
ensureDir(uploadsDir);

// TEMP STORAGE (short-lived uploads)

const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    cb(null, `temp-${Date.now()}-${file.originalname}`);
  },
});

export const uploadTemp = multer({
  storage: tempStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional smaller limit for temp
});

// PERMANENT STORAGE (long-term uploads)

const permanentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type || "general";
    const folder = path.join(uploadsDir, type);
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const uploadPermanent = multer({
  storage: permanentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed (JPEG/PNG)"), false);
  },
});

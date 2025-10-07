import express from "express";
const router = express.Router({ mergeParams: true });

// Middleware
import { protect } from "../middleware/authmiddleware.js";

// Controllers
import { updateBasicInfo, getBasicInfo } from "../controller/basicInfoController.js";
import { updateHealthStatus, getHealthStatus } from "../controller/healthStatusController.js";
import { updateMedicalHistory, getMedicalHistory } from "../controller/medicalHistoryController.js";
import { updateTreatmentInfo, getTreatmentInfo } from "../controller/treatmentInfoController.js";
import { updateLabResults, getLabResults } from "../controller/labResultController.js";
import { updateNotes, getNotes } from "../controller/noteController.js";

// Apply authentication to all routes
router.use(protect);

// Health Profile Management Endpoints

// --- Basic Info ---
router.post("/basic-info", updateBasicInfo);    // Create or update basic info
router.get("/basic-info", getBasicInfo);        // Get basic info

// --- Health Status ---
router.post("/health-status", updateHealthStatus);  // Create or update health status
router.get("/health-status", getHealthStatus);      // Get health status

// --- Medical History ---
router.post("/medical-history", updateMedicalHistory);  // Create or update medical history
router.get("/medical-history", getMedicalHistory);      // Get medical history

// --- Treatment Info ---
router.post("/treatment-info", updateTreatmentInfo);    // Create or update treatment info
router.get("/treatment-info", getTreatmentInfo);        // Get treatment info

// --- Lab Results ---
router.post("/lab-results", updateLabResults);          // Create or update lab results
router.get("/lab-results", getLabResults);              // Get lab results

// --- Notes ---
router.post("/notes", updateNotes);                     // Create or update notes
router.get("/notes", getNotes);                         // Get notes

export default router;

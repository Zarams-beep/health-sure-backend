import express from "express";

// 🔥 This is the important change
const router = express.Router({ mergeParams: true });

import { protect } from "../middleware/authmiddleware.js";
import { updateBasicInfo } from "../controller/basicInfoController.js";
import { updateHealthStatus } from "../controller/healthStatusController.js";
import { updateMedicalHistory } from "../controller/medicalHistoryController.js";
import { updateTreatmentInfo } from "../controller/treatmentInfoController.js";
import { updateLabResults } from "../controller/labResultController.js";
import { updateNotes } from "../controller/noteController.js";

// Apply authentication to all health-edit routes
router.use(protect);

// Health Profile Management Endpoints
router.post("/basic-info", updateBasicInfo);
router.post("/health-status", updateHealthStatus);
router.post("/medical-history", updateMedicalHistory);
router.post("/treatment-info", updateTreatmentInfo);
router.post("/lab-results", updateLabResults);
router.post("/notes", updateNotes);

export default router;

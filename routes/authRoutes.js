import express from "express";
import { loginUser, registerUser, userProfile } from "../controller/authController.js";
import { registrationValidator, loginValidator } from "../utils/Validators.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import authMiddleware from "../middleware/authmiddleware.js";
import { uploadTemp, uploadPermanent } from "../middleware/upload.js";


const router = express.Router();

router.post(
  "/register",
  uploadTemp.single("image"),
  validationMiddleware(registrationValidator),
  registerUser
);
router.post("/login", validationMiddleware(loginValidator), loginUser);
router.get("/profile", authMiddleware, userProfile);

export default router;

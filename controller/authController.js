import AppError from "../utils/AppError.js";
import { createUser } from "../services/users/createUser.js";
import { logUserIntoApp, logUserOutOfApp} from "../services/users/logs.js";
import { getUserProfile, updateUserProfile} from "../services/users/profile.js";
import { changeUserPassword } from "../services/users/changePassword.js";
import { generateOTP, storeOTP, getOTP, deleteOTP } from "../services/users/otp.js";
import { sendEmail, renderTemplate } from "../services/emailService.js";
import User from "../models/user.js";
import { Op } from "sequelize";


async function registerUser (req,res){
    try{
        const{
            fullName,
            email, 
            password,
            image,
        } = req.body;
        const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
          { fullName: fullName.toLowerCase() }
        ]
      }
    });

    if (existingUser){
      if (existingUser.email === email.toLowerCase()) {
        throw new Error("Email already registered");
      }
      if (existingUser.fullName === fullName.toLowerCase()) {
        throw new Error("Fullname already exists", 400);
      }
    }

    await createUser({
        fullName,
        email,
        password,
        image,
    });
        res.status(201).json({success:true, message:"User registered"});
    }
    catch(error){
        throw new AppError(error || "Registration failed", 400)
    }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await logUserIntoApp({ email, password });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    throw new AppError(error || "Invalid Email or Password", 401);
  }
}

async function logoutUser(req, res, next) {
  try {
    const userId = req.user?.user_uuid;
    
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await logUserOutOfApp(userId);
    
    res.status(200).json({ 
      success: true, 
      message: result.message 
    });
  } catch (error) {
    next(new AppError(error.message || "Logout failed", 500));
  }
}

async function changePassword(req, res, next) {
  try {
    const userId = req.user?.user_uuid;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    if (!currentPassword || !newPassword) {
      throw new AppError("Current password and new password are required", 400);
    }

    await changeUserPassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(new AppError(error.message || "Password change failed", 400));
  }
}

async function getEmailOTP(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError("Email not found", 404);
    }

    const otp = generateOTP();
    await storeOTP(email, otp);

    try {
      const emailHtml = await renderTemplate("otpEmail", { otp });
      await sendEmail(email, "Your Verification Code - NotePad", emailHtml);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to email successfully",
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    next(new AppError(error.message || "Failed to send OTP", 500));
  }
}

async function verifyEmailOTP(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp) {
      throw new AppError("Email and OTP are required", 400);
    }

    if (!newPassword) {
      throw new AppError("New password is required", 400);
    }

    const storedOTP = await getOTP(email);

    if (!storedOTP) {
      throw new AppError("OTP expired or not found", 400);
    }

    if (storedOTP !== otp) {
      throw new AppError("Invalid OTP", 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.password = newPassword;
    await user.save();

    console.log("Password updated successfully for:", email);
    await deleteOTP(email);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(new AppError(error.message || "OTP verification failed", 400));
  }
}

async function userProfile(req, res, next) {
  try {
    const userId = req.user?.user_uuid;

    if (!userId) throw new AppError("Unauthorized user", 401);

    const profile = await getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(new AppError(error.message || "User not found", 404));
  }
}

async function updateProfile(req, res, next) {
try{
  const userId = req.user?.user_uuid;
  if (!userId) throw new AppError("Unauthorized user", 401);

    const updatedProfile = await updateUserProfile(userId, {
      fullName: req.body.fullName,
      email: req.body.email,
      file: req.file
    });

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
}catch (error) {
    next(new AppError(error.message || "Profile update failed", 400));
}
}

export {
  registerUser,
  loginUser,
  logoutUser, 
  changePassword,
  getEmailOTP,
  verifyEmailOTP,
  userProfile,
  updateProfile
};
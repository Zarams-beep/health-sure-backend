import AppError from "../utils/AppError.js";
import { createUser, logUserIntoApp, getUserProfile } from "../services/userService.js";

async function registerUser (req,res){
    try{
        const{
            fullName,
            email, 
            password,
            image,
        } = req.body;
        await createUser ({
            fullName,email,password,image
        });
        res.status(201).json({success:true, message:"User registered"});
    }
    catch(error){
        throw new AppError(error || "Registration failed", 400)
    }
}

async function loginUser(req, res) {
  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;
    const user = await logUserIntoApp({ email, password });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    throw new AppError(error || "Invalid Email or Password", 401);
  }
}

function changePassword(req, res) {
  // Change password logic here
  res.send("Password changed");
}

function getEmailOTP(req, res) {
  // Get email OTP logic here
  res.send("Email OTP sent");
}

function verifyEmailOTP(req, res) {
  // Verify email OTP logic here
  res.send("Email OTP verified");
}

 async function userProfile(req, res, next) {
  try {
    const userId = req.user?.id; // usually set by JWT middleware

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

 async function logoutUser(req, res, next) {
  try {
    const userId = req.user?.id;

    await logUserOutOfApp(userId);

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(new AppError(error.message || "Logout failed", 400));
  }
}

export { registerUser, loginUser, changePassword, getEmailOTP, verifyEmailOTP, userProfile };

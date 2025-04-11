import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Import your User model

export const protect = async (req, res, next) => {
  // 1. Handle missing token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized - No token provided" 
    });
  }

  // 2. Extract token
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Verify user exists in DB (critical!)
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    // 5. Attach full user data to request
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName
    };

    next();
  } catch (error) {
    console.error("🔒 Auth Middleware Error:", error.message);

    // Specific error responses
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired - Please login again"
      });
    }

    return res.status(403).json({
      success: false,
      message: "Not authorized - Invalid token"
    });
  }
};
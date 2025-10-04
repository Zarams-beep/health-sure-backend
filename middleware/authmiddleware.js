import jwt from "jsonwebtoken";
import redis from "../config/redis.js"; // make sure you created and exported Redis instance

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ Check if token is blacklisted in Redis
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(403).json({ message: "Token has been revoked. Please log in again." });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store user info (e.g., { id, iat, exp }) for later use

    next();
  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

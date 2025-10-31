import User from "../models/user.js";
import utils from "../utils/Auth.js";
import cache from "../config/cache.js";

// Create a new user
export async function createUser(userData) {
  // Check if email exists
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) throw new Error("Email already registered");

  // Check if username (full name) exists
  const checkUsernameExists = await User.findOne({
    where: { fullName: userData.fullName },
  });
  if (checkUsernameExists) throw new Error("User already exists");

  // Create user
  const newUser = await User.create(userData);
  return newUser;
}

// 🟢 Log a user into the app
export async function logUserIntoApp(loginCredentials) {
  const user = await User.findOne({
    where: { email: loginCredentials.email },
  });

  if (!user) throw new Error("Invalid Email or Password");

  const isPasswordValid = await user.verifyPassword(loginCredentials.password);
  if (!isPasswordValid) throw new Error("Invalid Email or Password");

  // Generate tokens
  const token = await utils.generateToken(user);
  const refreshToken = await utils.generateRefreshToken(user, token);

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    image: user.image,
    token,
    refreshToken,
  };
}

// 🟢 Refresh the user's tokens
export async function refreshUserToken(refreshToken) {
  const decoded = await utils.verifyRefreshToken(refreshToken);

  const user = await User.findOne({ where: { id: decoded.id } });
  if (!user) throw new Error("User not found");

  const newToken = await utils.generateToken(user);
  const newRefreshToken = await utils.generateRefreshToken(user, newToken);

  return {
    token: newToken,
    refreshToken: newRefreshToken,
  };
}

// 🟢 Log a user out (optional token invalidation)
export async function logUserOutOfApp(userId) {
  if (cache) {
    await cache.del(`userTokens:${userId}`);
  }
  return { message: "User logged out successfully" };
}

// 🟢 Get user profile (with caching)
export async function getUserProfile(userId) {
  // 1️⃣ Try to get from cache
  if (cache) {
    const cachedProfile = await cache.get(`userProfile:${userId}`);
    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }
  }

  // 2️⃣ If not cached, fetch from DB
  const user = await User.findOne({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  // 3️⃣ Remove password from data
  const userData = { ...user.dataValues };
  delete userData.password;

  // 4️⃣ Store in cache for next time
  if (cache) {
    await cache.set(`userProfile:${userId}`, JSON.stringify(userData), 3600); 
  }

  return userData;
}

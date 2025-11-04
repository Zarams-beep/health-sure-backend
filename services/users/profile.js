import User from "../../models/user.js";
import cache from "../../config/cache.js";
import fs from "fs/promises";
import path from "path";

// Get user profile (with caching)
export async function getUserProfile(userId) {
  // 1️⃣ Try to get from cache
  if (cache && cache.redis) {
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
  if (cache && cache.redis) {
    await cache.set(`userProfile:${userId}`, JSON.stringify(userData), 3600); 
  }

  return userData;
}

export async function updateUserProfile(userId, requestData) {
  let tempFilePath = null;

  try {
    // ✅ Find user by UUID or ID
    const user = await User.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    // Prepare fields to update
    const updateData = {};

    if (requestData.fullName) updateData.fullName = requestData.fullName;
    if (requestData.email) updateData.email = requestData.email;

    // ✅ Handle file upload
    if (requestData.file) {
      tempFilePath = requestData.file.path;

      // Ensure the directory exists
      const avatarsDir = path.join("uploads", "avatars");
      await fs.mkdir(avatarsDir, { recursive: true });

      // Create a unique filename
      const filename = `${userId}-${Date.now()}${path.extname(requestData.file.originalname)}`;
      const permanentPath = path.join(avatarsDir, filename);

      // Move temp file → permanent folder
      await fs.rename(tempFilePath, permanentPath);
      tempFilePath = null; // Clear after move

      // If user already has an image, delete the old one
      if (user.image) {
        await fs.unlink(user.image).catch((err) =>
          console.error("Error deleting old profile picture:", err)
        );
      }

      updateData.image = permanentPath;
    }

    // ✅ Apply all updates
    await user.update(updateData);
    await user.reload();

    // Create response object (without password)
    const userResponse = user.toJSON();
    delete userResponse.password;

    // ✅ Update cache if available
    if (cache && cache.redis) {
      const cacheKey = `userProfile:${userId}`;
      await cache.del(cacheKey);
      await cache.set(cacheKey, userResponse, 3600); // 1 hour
    }

    return userResponse;
  } catch (error) {
    // Delete temp file if something went wrong
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch((err) =>
        console.error("Error deleting temp file:", err)
      );
    }

    console.error("Error updating user profile:", error);
    throw new Error(error.message || "Unable to update profile");
  }
}
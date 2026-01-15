import User from "../../models/user.js";
import utils from "../../utils/Auth.js";
import AppError from "../../utils/AppError.js";

export async function changeUserPassword(userId, currentPassword, newPassword) {
  // Find user
  const user = await User.findOne({ where: { userId: user.id } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Verify current password
  const isPasswordValid = await utils.comparePassword(
    currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  // Validate new password
  if (newPassword.length < 6) {
    throw new AppError("New password must be at least 6 characters long", 400);
  }

  // Hash new password
  const hashedPassword = await utils.hashPassword(newPassword);

  // Update password
  user.password = hashedPassword;
  await user.save();

  return { message: "Password changed successfully" };
}
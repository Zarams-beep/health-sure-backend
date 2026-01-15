import User from "../../models/user.js";
import cache from "../../config/cache.js";
import crypto from "node:crypto";
import { sendEmail, renderTemplate } from "../emailService.js";
import config from "../../config/index.js";

export async function changePassword (userId, currentPassword, newPassword){
  try{
    const user = await User.findOne({
      where: {id: userId}
    });
    if (!user) throw new Error ("User not found");

    // Verify current password
    const isValidPassword = await user.verifyPassword(currentPassword);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }
     // Validate new password
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long");}

       if (currentPassword === newPassword) {
      throw new Error("New password must be different from current password");
    }

        // Update password (will be hashed by beforeUpdate hook)
    await user.update({ password: newPassword });

    // Send notification email
    await sendPasswordChangeNotification(user);

    // Invalidate any cached sessions or tokens
    if (cache && cache.redis) {
      await cache.del(`userProfile:${userId}`);
      await cache.del(`userSessions:${userId}`);
    }
    return { success: true, message: "Password changed successfully" };
  }
  catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

export async function requestPasswordReset(email) {
  try {
    const user = await User.findOne({
      where:{email:email.toLowerCase()}
    });

    // Don't reveal if user exists for security
    if (!user) {
      return {
        success: true,
        message: "If an account exists, a reset link has been sent",
      };
    }

    //Generate reset token
     const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Store token in cache (or you could add fields to User model)
    if (cache && cache.redis) {
      await cache.set(
        `passwordReset:${resetToken}`,
        JSON.stringify({ userId: user.user_uuid, email: user.email }),
        resetTokenExpiry // 1 hour TTL
      );
    }    

    // Send reset email
    await sendPasswordResetEmail(user, resetToken);
  
     return {
      success: true,
      message: "If an account exists, a reset link has been sent",
    };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw new Error("Unable to process password reset request");
  }
}


export async function resetPassword(token, newPassword) {
  try {
    // Validate new password
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Get user from token
    if (!cache || !cache.redis) {
      throw new Error("Password reset service unavailable");
    }

    const tokenData = await cache.get(`passwordReset:${token}`);
    if (!tokenData) {
      throw new Error("Invalid or expired reset token");
    }

    const { userId } = JSON.parse(tokenData);
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    // Update password
    await user.update({ password: newPassword });

    // Delete used token
    await cache.del(`passwordReset:${token}`);

    // Send confirmation email
    await sendPasswordResetConfirmation(user);

    // Invalidate sessions
    await cache.del(`userProfile:${userId}`);
    await cache.del(`userSessions:${userId}`);

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}



async function sendPasswordChangeNotification(user) {
  const html = await renderTemplate("password-changed", {
    fullName: user.fullName,
    email: user.email,
     date: new Date().toLocaleString(),});

     const text = `Hello ${
    user.fullName
  },\n\nYour password was changed successfully on ${new Date().toLocaleString()}.\n\nIf you did not make this change, please contact support immediately.`;

  await sendEmail(user.email, "Password Changed Successfully", html, text);
  }

  async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${config.TOTAL_URL}/reset-password?token=${token}`;

  const html = await renderTemplate("password-reset", {
    fullName: user.fullName,
    resetUrl,
    expiryTime: "1 hour",
  });

  const text = `Hello ${user.fullName},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`;

  await sendEmail(user.email, "Password Reset Request", html, text);
}

async function sendPasswordResetConfirmation(user) {
  const html = await renderTemplate("password-reset-confirmation", {
    fullName: user.fullName,
    date: new Date().toLocaleString(),
  });

  const text = `Hello ${
    user.fullName
  },\n\nYour password was reset successfully on ${new Date().toLocaleString()}.\n\nIf you did not make this change, please contact support immediately.`;

  await sendEmail(user.email, "Password Reset Successful", html, text);
}

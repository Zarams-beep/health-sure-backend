import User from "../../models/user.js";
import utils from "../../utils/Auth.js";
import cache from "../../config/cache.js";
import { sendEmail, renderTemplate } from "../emailService.js";

// Log a user into the app
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

  await sendLoginNotification(user);

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    image: user.image,
    token,
    refreshToken,
  };
}

export async function logUserOutOfApp(userId) {
  if (cache) {
    await cache.del(`userTokens:${userId}`);
  }
  return { message: "User logged out successfully" };
}


async function sendLoginNotification(user){
  const html = await renderTemplate("login-notification",{
    fullName: user.fullName,
    email: user.email,
     loginTime: new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    }),
    location: "Chizaram City",
    device: "Backend Device",
  });

  const text = `Hello ${
    user.fullName
  },\n\nA login attempt was made o your account at ${new Date().toLocaleString()}.\n\nIf you did not make this attempt, please contact support immediately.`;

  await sendEmail(user.email, "Login Attempt", html, text);
}
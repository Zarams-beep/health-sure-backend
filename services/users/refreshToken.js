import User from "../../models/user.js";
import utils from "../../utils/Auth.js";

// Refresh the user's tokens
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
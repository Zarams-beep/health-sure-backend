import utils from "../utils/Auth.js";
import User from "../models/user.js";

async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = auth.split(" ")[1];
    const payload = await utils.verifyToken(token);

    const user = await User.findOne({ where: { user_uuid: payload.id } });

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    delete user.password;

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

export default authMiddleware;

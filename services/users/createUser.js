import User from "../../models/user.js";


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
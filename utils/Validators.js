import { z } from "zod";

// Registration Validator - REMOVE confirmPassword
export const registrationValidator = z.object({
  fullName: z
    .string({
      required_error: "fullName is required",
    })
    .min(3, "fullName must be at least 3 characters long"),

  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format"), // Fixed typo

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters long"),
  
  image: z.any().optional(),
});

// Login Validator
export const loginValidator = z.object({
  email: z
    .string({
      required_error: "Invalid Email or Password",
    })
    .email("Invalid Email or Password"),

  password: z.string({
    required_error: "Invalid Email or Password",
  }),
});
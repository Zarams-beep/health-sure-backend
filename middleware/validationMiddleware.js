import { ZodError } from "zod";

/**
 * Zod validation middleware
 * @param {ZodSchema} schema - The Zod schema to validate request body
 */
const zodValidationMiddleware = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next(); // Continue if valid
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        data: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during validation",
    });
  }
};

export default zodValidationMiddleware;

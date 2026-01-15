import crypto from "crypto";
import cache from "../../config/cache.js";

/**
 * Generate a 6-digit OTP
 */
export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Store OTP in Redis with 5-minute expiry
 */
export async function storeOTP(email, otp) {
  const key = `otp:${email}`;
  const expirySeconds = 300; // 5 minutes

  if (cache && cache.redis) {
    await cache.set(key, otp, expirySeconds);
  } else {
    throw new Error("Redis cache not available");
  }
}

/**
 * Retrieve OTP from Redis
 */
export async function getOTP(email) {
  const key = `otp:${email}`;

  if (cache && cache.redis) {
    return await cache.get(key);
  }
  
  throw new Error("Redis cache not available");
}

/**
 * Delete OTP after successful verification
 */
export async function deleteOTP(email) {
  const key = `otp:${email}`;

  if (cache && cache.redis) {
    await cache.del(key);
  }
}
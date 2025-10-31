import dotenv from "dotenv";
dotenv.config();

export default {
    DB_NAME: process.env.DB_NAME || 'health-sure-db',
    DB_USER: process.env.DB_USER || 'health-sure',
    DB_PASSWORD: process.env.DB_PASSWORD || 'health-sure-password',
    DB_HOST : process.env.DB_HOST || 'localhost',
    DB_PORT : process.env.DB_PORT || 5432,
      REDIS_TTL: Number(process.env.REDIS_TTL || 300),
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID || 'none for now',
  CALLBACK_URL_GOOGLE : process.env.CALLBACK_URL_GOOGLE || 'http://localhost:5000/auth/google/callback',
  CALLBACK_URL_GITHUB : process.env.CALLBACK_URL_GITHUB || 'http://localhost:5000/auth/github/callback',
  JWT_SECRET : process.env.JWT_SECRET || "your_jwt_secret_key",
   JWT_EXPIRES_IN: Number(process.env.JWT_EXPIRES_IN || 7200),

   TOTAL_URL : process.env.LOCAL_URL || process.env.PROD_URL,

   PORT : process.env.PORT || 5000
}
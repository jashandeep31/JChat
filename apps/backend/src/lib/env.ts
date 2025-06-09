import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT,
  GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
};

for (const [key, value] of Object.entries(env)) {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

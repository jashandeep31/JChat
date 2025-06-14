import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT,
  GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
  GOOGLE_GENERATIVE_AI_API_KEY: process.env
    .GOOGLE_GENERATIVE_AI_API_KEY as string,
  GOOGLE_WEB_SEARCH_API_KEY: process.env.GOOGLE_WEB_SEARCH_API_KEY as string,
  GOOGLE_CX: process.env.GOOGLE_CX as string,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  S3_REGION: process.env.S3_REGION as string,
  S3_BUCKET: process.env.S3_BUCKET as string,
};

for (const [key, value] of Object.entries(env)) {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

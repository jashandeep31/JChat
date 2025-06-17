import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: process.env.REDIS_PORT as string,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY as string,
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
  GROQ_API_KEY: process.env.GROQ_API_KEY as string,
};

for (const [key, value] of Object.entries(env)) {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

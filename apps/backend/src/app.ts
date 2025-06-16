import express, { Request } from "express";
import cors from "cors";
import { db } from "./lib/db.js";
import generatePresignedUrlRoutes from "./routes/generate-presigned-url-routes.js";
import attachmentRoutes from "./routes/attachment-routes.js";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { env } from "./lib/env.js";
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use("/api/v1", (req: Request & { userId?: string }, res, next) => {
  const raw = req.headers.cookie || "";
  const { ["jwt-token"]: jwtToken } = cookie.parse(raw);
  if (!jwtToken) return next(new Error("Authentication error"));
  const decoded = jwt.verify(jwtToken, env.JWT_SECRET);
  req.userId = (decoded as any).user.id;
  next();
});

app.get("/api/v1", (req: Request & { userId?: string }, res) => {
  res.send(`Hello ${req.userId}`);
});
app.use("/api/v1", generatePresignedUrlRoutes);
app.use("/api/v1", attachmentRoutes);

// app.get("/delete", async (req, res) => {
//   await db.chatQuestionAnswer.deleteMany();
//   await db.chatQuestion.deleteMany();
//   await db.chat.deleteMany();
//   await db.project.deleteMany();

//   res.send("Deleted");
// });

export default app;

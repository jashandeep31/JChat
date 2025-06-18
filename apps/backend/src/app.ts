import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
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
app.use(express.json());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use("/api/v1", (req: Request & { userId?: string }, res, next) => {
  try {
    const raw = req.headers.cookie || "";
    const { ["jwt-token"]: jwtToken } = cookie.parse(raw);
    if (!jwtToken) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(jwtToken, env.JWT_SECRET);
      req.userId = (decoded as any).user.id;
      next();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Invalid JWT token:", error.message);
        return next(new Error("Authentication error"));
      }
      next(error);
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    next(new Error("Authentication error"));
  }
});

app.get("/api/v1", (req: Request & { userId?: string }, res) => {
  res.send(`Hello ${req.userId}`);
});
app.use("/api/v1", generatePresignedUrlRoutes);
app.use("/api/v1", attachmentRoutes);
// app.use("/api/v1/delete", async (req, res) => {
//   await db.chat.deleteMany();
//   await db.chatQuestion.deleteMany();
//   await db.chatQuestionAnswer.deleteMany();
//   await db.chatShareLink.deleteMany();
//   await db.project.deleteMany();
//   res.send("Deleted");
// });
// Global error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(`Global error handler caught:`, err);

  // Determine if the error is related to authentication
  if (err.message === "Authentication error") {
    res.status(401).json({
      status: "error",
      message: "Authentication failed. Please log in again.",
    });
  } else {
    // Default error response
    res.status(500).json({
      status: "error",
      message: "An internal server error occurred.",
    });
  }
};

// Handle 404 - keep this after all routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Requested resource not found",
  });
});

// Add error handler last
app.use(errorHandler);

export default app;

import express from "express";
import cors from "cors";
import { db } from "./lib/db.js";
import generatePresignedUrlRoutes from "./routes/generate-presigned-url-routes.js";
import attachmentRoutes from "./routes/attachment-routes.js";
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use("api/v1", generatePresignedUrlRoutes);
app.use("api/v1", attachmentRoutes);

app.get("/delete", async (req, res) => {
  await db.chatQuestionAnswer.deleteMany();
  await db.chatQuestion.deleteMany();
  await db.chat.deleteMany();
  await db.project.deleteMany();

  res.send("Deleted");
});

export default app;

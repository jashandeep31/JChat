import express from "express";
import cors from "cors";
import { db, redis } from "./lib/db.js";
import { generatePresignedUrl } from "./services/s3.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.post("/api/v1/generate-presigned-url", async (req, res) => {
  const body = req.body;
  const contentType = body.contentType;
  const name = body.name;
  const allowedContentTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedContentTypes.includes(contentType)) {
    res.status(400).json({ error: "Invalid content type" });
    return;
  }

  const result = await generatePresignedUrl("attachments", name, contentType);
  res.json({ result });
});

app.post("/create/attachment", async (req, res) => {
  const body = req.body;
  const attachmentId = body.attachmentId;

  const attachmentMetaData = await redis.get(`presigned:${attachmentId}`);
  if (!attachmentMetaData) {
    res.status(404).json({ error: "Attachment not found" });
    return;
  }
  const metaData = JSON.parse(attachmentMetaData) as {
    key: string;
    filename: string;
    contentType: string;
    size: number;
    status: string;
    presignedUrl: string;
    expiresAt: Date;
    publicUrl: string;
  };
  console.log(metaData);
  const attachment = await db.attachment.create({
    data: {
      uploadId: attachmentId,
      publicUrl: metaData.publicUrl,
      filename: metaData.filename || "unknown",
      userId: "1945b260-5c8a-4134-862f-8e255d34c7e6",
      type: metaData.contentType.includes("pdf") ? "PDF" : "IMAGE",
    },
  });

  redis.set(`attachment:${attachmentId}`, JSON.stringify(attachment));
  res.json({ attachment });
});

app.get("/delete", async (req, res) => {
  await db.chatQuestionAnswer.deleteMany();
  await db.chatQuestion.deleteMany();
  await db.chat.deleteMany();
  await db.project.deleteMany();

  res.send("Deleted");
});

export default app;

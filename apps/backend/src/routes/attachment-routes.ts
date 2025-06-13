import { Router } from "express";
import { db, redis } from "../lib/db.js";
const router = Router();

router.route("/create/attachment").post(async (req, res) => {
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

export default router;

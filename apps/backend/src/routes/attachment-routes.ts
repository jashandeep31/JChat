import { Router, Request, Response } from "express";
import { db, redis } from "../lib/db.js";
const router = Router();

router
  .route("/create/attachment")
  .post(async (req: Request & { userId?: string }, res: Response) => {
    const body = req.body;
    const attachmentId = body.attachmentId;
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

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
        userId: req.userId,
        type: metaData.contentType.includes("pdf") ? "PDF" : "IMAGE",
      },
    });

    redis.set(`attachment:${attachmentId}`, JSON.stringify(attachment));
    res.json({ attachment });
  });

export default router;

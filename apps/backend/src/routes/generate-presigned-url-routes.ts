import { Router, Request, Response } from "express";
import { generatePresignedUrl } from "../services/s3.js";

const router = Router();

router
  .route("/generate-presigned-url")
  .post(async (req: Request & { userId?: string }, res: Response) => {
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
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await generatePresignedUrl("attachments", name, contentType);
    res.json({ result });
  });

export default router;

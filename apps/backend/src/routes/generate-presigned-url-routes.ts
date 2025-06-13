import { Router } from "express";
import { generatePresignedUrl } from "../services/s3.js";

const router = Router();

router.route("/generate-presigned-url").post(async (req, res) => {
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

export default router;

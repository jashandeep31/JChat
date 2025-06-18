import { uploadtoS3 } from "../../services/s3.js";

export const getBase64OfImage = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
    }
    const imageArrayBuffer = await response.arrayBuffer();
    const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");
    return base64ImageData;
  } catch (error) {
    throw error;
  }
};

export async function uploadBase64Image(
  base64OrDataUrl: string,
  opts: { path: string; originalName: string }
) {
  let contentType:
    | "image/png"
    | "image/jpeg"
    | "image/webp"
    | "application/pdf" = "image/png";
  let payload = base64OrDataUrl;

  const dataUrlMatch = base64OrDataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (dataUrlMatch) {
    contentType = dataUrlMatch[1] as typeof contentType;
    payload = dataUrlMatch[2];
  }

  const fileBuffer = Buffer.from(payload, "base64");

  return uploadtoS3(opts.path, opts.originalName, contentType, fileBuffer);
}

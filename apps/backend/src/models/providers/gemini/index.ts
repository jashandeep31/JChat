import { smoothStream, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { AiModel, Attachment, ChatQuestion } from "@repo/db";
import { getAttachment } from "../../../services/attachment-cache.js";
import { getChat } from "../../../services/chat-cache.js";

// Define content type based on Google AI SDK requirements
type ContentItem =
  | { type: "text"; text: string }
  | { type: "image"; image: string; mimeType: string };

export const askGeminiQuestion = async (
  question: ChatQuestion,
  model: AiModel,
  onChunk: (chunk: string) => void,
  onImageChunk: (chunk: string) => void
): Promise<{ text: string; images: string }> => {
  const chat = await getChat(question.chatId, null, true);

  // Prepare messages array compatible with AI SDK
  const messages: Array<{
    role: "user" | "system" | "assistant";
    content: string | ContentItem[];
  }> = [];

  // Add system instruction if available for text generation models
  if (model.type === "TEXT_GENERATION" && chat?.instruction) {
    messages.push({
      role: "system",
      content: chat.instruction,
    });
  }

  // Build user content array
  const userContent: ContentItem[] = [
    { type: "text", text: question.question },
  ];

  // Handle attachment if it exists
  if (question.attachmentId) {
    try {
      const attachment: Attachment | null = await getAttachment(
        question.attachmentId
      );
      if (attachment) {
        const base64Image = await getBase64OfImage(attachment.publicUrl);
        userContent.push({
          type: "image",
          image: base64Image,
          mimeType: "image/jpeg", // Using fixed mime type as attachment might not have mimeType property
        });
      }
    } catch (error) {
      console.error("Failed to process attachment:", error);
      // Continue with text-only query if attachment processing fails
    }
  }

  // Add user message with content
  messages.push({
    role: "user",
    content: userContent,
  });

  // Configure model options
  const modelOptions =
    model.webAnalysis && question.webSearch
      ? { useSearchGrounding: true }
      : undefined;

  // Configure provider options for handling both text and potentially images
  const providerOptions = {
    google: {
      responseModalities: [
        "TEXT",
        model.type === "IMAGE_GENERATION" ? "IMAGE" : null,
      ].filter(Boolean),
    },
  };

  let text = "";
  let images = "";

  try {
    const { fullStream } = streamText({
      model: google(model.slug, modelOptions),
      providerOptions,
      messages: messages as any, // Type casting needed for compatibility with AI SDK
      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: "line",
      }),
    });

    // Process the stream and collect text and images
    for await (const part of fullStream) {
      switch (part.type) {
        case "text-delta":
          text += part.textDelta;
          onChunk(part.textDelta);
          break;
        case "file":
          images += part.base64;
          onImageChunk(part.base64);
          break;
      }
    }
  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    // If API errors out, provide error message to the user
    const errorMessage = error instanceof Error ? error.message : String(error);
    const failureMessage = `Failed to generate response: ${errorMessage}`;
    onChunk(failureMessage);
    text = failureMessage;
  }

  return { text, images };
};

/**
 * Fetches an image from a URL and converts it to base64 format
 * @param imageUrl URL of the image to fetch
 * @returns Promise resolving to base64-encoded image data
 */
const getBase64OfImage = async (imageUrl: string): Promise<string> => {
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
    console.error(`Error processing image ${imageUrl}:`, error);
    throw error; // Re-throw to let the caller handle it
  }
};

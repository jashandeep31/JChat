import { ProviderFunctionParams, ProviderResponse } from "../../index.js";
import {
  ContentListUnion,
  createPartFromUri,
  GenerateContentResponse,
  GenerateImagesResponse,
  GoogleGenAI,
} from "@google/genai";
import { env } from "../../../lib/env.js";
import { Content } from "@google/genai";
import { AiModel, ChatQuestion } from "@repo/db";
import { getAttachment } from "../../../services/attachment-cache.js";

export const askGeminiQuestion = async ({
  question,
  model,
  apiKey,
  messages,
  onChunk,
  onImageChunk,
  onWebSearchChunk,
  onReasoningChunk,
}: ProviderFunctionParams): Promise<ProviderResponse> => {
  try {
    let text = "";
    let images = "";
    let reasoning = "";
    let webSearches: { title: string; url: string }[] = [];
    const seenUrls = new Set<string>();
    const systemContents: string[] = [];
    const otherMessages: Content[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemContents.push(msg.content);
      } else {
        const role = msg.role === "assistant" ? "model" : "user";
        otherMessages.push({
          role,
          parts: [{ text: msg.content }],
        });
      }
    }
    const googeAi = new GoogleGenAI({
      apiKey: apiKey || env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    if (model.type === "TEXT_GENERATION") {
      const response = await repsonseTextStream({
        googleAi: googeAi,
        model: model,
        otherMessages: otherMessages,
        systemContents: systemContents,
        question: question,
      });

      for await (const chunk of response) {
        text += chunk.text || "";
        onChunk(chunk.text || "");
        const candidate = chunk.candidates?.[0];
        const contentParts = candidate?.content?.parts;
        const currentThought = contentParts?.[0]?.thought;
        const thoughtText = contentParts?.[0]?.text || "";
        if (currentThought) {
          reasoning += thoughtText || "";
          onReasoningChunk(thoughtText || "");
        }
        const groundingMetadata = chunk.candidates?.[0].groundingMetadata;
        if (groundingMetadata) {
          groundingMetadata.groundingChunks?.forEach((gchunk) => {
            const web = gchunk.web;
            if (web?.uri && web?.title && !seenUrls.has(web.uri)) {
              webSearches.push({
                title: web.title,
                url: web.uri,
              });
              seenUrls.add(web.uri);
            }
            onWebSearchChunk(webSearches);
          });
        }
      }

      return { text, images, webSearches, reasoning };
    } else {
      const response = await responseImageStream({
        googleAi: googeAi,
        model: model,
        otherMessages: otherMessages,
        systemContents: systemContents,
        question: question,
      });
      if (response.generatedImages) {
        const firstImage = response.generatedImages[0];
        if (!firstImage.image?.imageBytes) {
          text = "Failed to generate image";
          onChunk("Failed to generate image");
          return { text, images, webSearches, reasoning };
        }
        images = firstImage.image?.imageBytes || "";
        onImageChunk(images);
        return { text, images, webSearches, reasoning };
      }
      return { text, images, webSearches, reasoning };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const failureMessage = `Failed to generate response: ${errorMessage}`;
    onChunk(failureMessage);
    return { text: failureMessage, images: "", webSearches: [], reasoning: "" };
  }
};

const repsonseTextStream = async ({
  googleAi,
  model,
  otherMessages,
  systemContents,
  question,
}: {
  googleAi: GoogleGenAI;
  model: AiModel;
  otherMessages: Content[];
  systemContents: string[];
  question: ChatQuestion;
}): Promise<AsyncGenerator<GenerateContentResponse>> => {
  const uploadGoogleFile = async () => {
    if (!question.attachmentId) return;
    const attachment = await getAttachment(question.attachmentId);
    if (!attachment) return;
    const response = await fetch(attachment.publicUrl);
    const blob = await response.blob();
    const file = await googleAi.files.upload({
      file: blob,
      config: {
        displayName: attachment.id + "-" + attachment.filename,
      },
    });
    let getFile = await googleAi.files.get({ name: file.name as string });
    while (getFile.state === "PROCESSING") {
      getFile = await googleAi.files.get({ name: file.name as string });
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    }
    if (file.state === "FAILED") {
      throw new Error("File processing failed.");
    }
    return getFile;
  };
  const content: ContentListUnion = [question.question];

  const file = await uploadGoogleFile();
  if (file && file.uri && file.mimeType) {
    const fileContent = createPartFromUri(file.uri, file.mimeType);
    content.push(fileContent);
  }
  return googleAi.models.generateContentStream({
    model: model.slug,
    contents: [...content],
    config: {
      systemInstruction: systemContents.join("\n\n"),
      tools: question.webSearch ? [{ googleSearch: {} }] : [],
      thinkingConfig: {
        includeThoughts: true,
      },
    },
  });
};

const responseImageStream = ({
  googleAi,
  model,
  question,
}: {
  googleAi: GoogleGenAI;
  model: AiModel;
  otherMessages: Content[];
  systemContents: string[];
  question: ChatQuestion;
}): Promise<GenerateImagesResponse> => {
  return googleAi.models.generateImages({
    model: model.slug,
    prompt: question.question,
    config: {
      numberOfImages: 1,
    },
  });
};

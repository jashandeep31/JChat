import { companies, companySlugs } from "./companies";
import { Model } from "./seed";

const baseMode: {
  logo: string;
  requiresPro?: boolean;
  credits?: number;
  pdfAnalysis?: boolean;
  imageAnalysis?: boolean;
  companySlug: (typeof companySlugs)[number];
  webAnalysis?: boolean;
  reasoning?: boolean;
  type: "TEXT_GENERATION" | "IMAGE_GENERATION";
} = {
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/1024px-ChatGPT-Logo.svg.png",
  companySlug: "open-ai",
  requiresPro: true,
  credits: 10,
  pdfAnalysis: false,
  imageAnalysis: false,
  webAnalysis: false,
  reasoning: false,
  type: "TEXT_GENERATION",
};

const models: Model[] = [];

models.push({
  ...baseMode,
  name: "GPT 4o Mini",
  slug: "gpt-4o-mini",
  tag: "Mini",
  webAnalysis: true,
  imageAnalysis: true,
  pdfAnalysis: true,
  credits: 2,
});

models.push({
  ...baseMode,
  name: "GPT 4o",
  slug: "gpt-4o",
  tag: "Pro",
  webAnalysis: true,
  imageAnalysis: true,
  pdfAnalysis: true,
  credits: 10,
});
models.push({
  ...baseMode,
  name: "o4 Mini",
  slug: "o4-mini",
  tag: "Reasoning model",
  reasoning: true,
});

export const openaiModels = models;

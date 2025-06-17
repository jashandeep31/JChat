import { companySlugs } from "./companies";
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
  logo: "https://img.icons8.com/fluent/512/claude.png",
  companySlug: "anthropic",
  requiresPro: true,
  credits: 20,
  pdfAnalysis: false,
  imageAnalysis: false,
  webAnalysis: false,
  reasoning: false,
  type: "TEXT_GENERATION",
};

const models: Model[] = [];

models.push({
  ...baseMode,
  name: "Claude 3.5 Haiku",
  slug: "claude-3-5-haiku-latest",
  tag: "Latest",
  requiresPro: true,
  credits: 20,
  pdfAnalysis: true,
  imageAnalysis: true,
  webAnalysis: true,
});

models.push({
  ...baseMode,
  name: "Claude 3.7 Sonnet",
  slug: "claude-3-7-sonnet-latest",
  tag: "Latest",
  requiresPro: true,
  credits: 20,
  pdfAnalysis: true,
  imageAnalysis: true,
  webAnalysis: true,
  reasoning: true,
});
export const anthropicModels = models;

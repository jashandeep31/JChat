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
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png",
  companySlug: "google",
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
  name: "Gemini 2.0 Flash",
  slug: "gemini-2.0-flash",
  tag: "Fast",
  requiresPro: false,
  credits: 3,
  pdfAnalysis: true,
  imageAnalysis: true,
  webAnalysis: true,
});
models.push({
  ...baseMode,
  name: "Gemini 2.5 Pro",
  slug: "gemini-2.5-pro-preview-05-06",
  tag: "Pro",
  requiresPro: true,
  credits: 5,
  pdfAnalysis: true,
  imageAnalysis: true,
  webAnalysis: true,
  reasoning: true,
});
models.push({
  ...baseMode,
  name: "Imagen 3.0 Generate",
  slug: "imagen-3.0-generate-002",
  tag: "Generate",
  type: "IMAGE_GENERATION",
  requiresPro: true,
  credits: 4,
});

export const googleModels = models;

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
  logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1A7gaDDexpewHghrUhXhUUw-RFxR4uIIbKf209FNVERmz0ov-BiEHige7skkVLzF40cA&usqp=CAU",
  companySlug: "groq",
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
  name: "Groq Llama 4 Scout",
  slug: "meta-llama/llama-4-scout-17b-16e-instruct",
  tag: "Pro",
  requiresPro: true,
  credits: 4,
  webAnalysis: true,
});

models.push({
  ...baseMode,
  name: "Llama 3.1",
  slug: "llama-3.1-8b-instant",
  tag: "Pro",
  logo: "https://nationaltechnology.co.uk/images/Meta%20Logo.png",
  requiresPro: true,
  credits: 4,
  webAnalysis: false,
});

models.push({
  ...baseMode,
  name: "Llama 3.0 8B",
  slug: "llama3-8b-8192",
  tag: "Pro",
  logo: "https://nationaltechnology.co.uk/images/Meta%20Logo.png",
  requiresPro: true,
  credits: 4,
  webAnalysis: false,
});

export const groqModels = models;

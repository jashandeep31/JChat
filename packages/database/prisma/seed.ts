import { PrismaClient } from "@prisma/client";
import { companies, companySlugs } from "./companies";
import { openaiModels } from "./openai";
import { googleModels } from "./gemini";
import { groqModels } from "./groq";

const prisma = new PrismaClient();

async function main() {
  for (const company of companies) {
    await prisma.company.upsert({
      where: {
        slug: company.slug,
      },
      update: {},
      create: company,
    });
  }

  const models = [...openaiModels, ...googleModels, ...groqModels];
  for (const { companySlug, ...model } of models) {
    const company = await prisma.company.findUnique({
      where: {
        slug: companySlug,
      },
    });
    if (!company) {
      throw new Error(`Company ${companySlug} not found`);
    }
    await prisma.aiModel.upsert({
      where: {
        slug: model.slug,
      },
      update: {},
      create: {
        ...model,
        companyId: company.id,
      },
    });
  }
}

main().catch((e) => {
  console.error(e);
});

export interface Model {
  name: string;
  slug: string;
  logo: string;
  tag?: string;
  requiresPro?: boolean;
  credits?: number;
  type: "TEXT_GENERATION" | "IMAGE_GENERATION";
  pdfAnalysis?: boolean;
  imageAnalysis?: boolean;
  webAnalysis?: boolean;
  reasoning?: boolean;
  companySlug: (typeof companySlugs)[number];
}

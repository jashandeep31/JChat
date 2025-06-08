import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const models: {
    name: string;
    slug: string;
    logo: string;
    tag?: string;
    requiresPro?: boolean;
    credits?: number;
    pdfAnalysis?: boolean;
    imageAnalysis?: boolean;
    webAnalysis?: boolean;
    reasoning?: boolean;
  }[] = [
    {
      name: "Chat GPT 4o",
      slug: "chat-gpt-4o",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/1024px-ChatGPT-Logo.svg.png",
      tag: "",
      requiresPro: true,
      credits: 1,
      pdfAnalysis: true,
      imageAnalysis: true,
      webAnalysis: true,
      reasoning: true,
    },
    {
      name: "Chat GPT 4o Mini",
      slug: "chat-gpt-4o-mini",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/1024px-ChatGPT-Logo.svg.png",
      tag: "Mini",
      requiresPro: false,
      credits: 0.25,
      pdfAnalysis: false,
      imageAnalysis: false,
      webAnalysis: false,
      reasoning: false,
    },
  ];

  for (const model of models) {
    await prisma.aiModel.upsert({
      where: {
        slug: model.slug,
      },
      update: {},
      create: model,
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

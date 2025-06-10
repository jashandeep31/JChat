import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const companies: {
    name: string;
    slug: string;
    logo: string;
  }[] = [
    {
      name: "Open AI",
      slug: "open-ai",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/1024px-ChatGPT-Logo.svg.png",
    },
    {
      name: "Google",
      slug: "google",
      logo: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.transparentpng.com%2Fcats%2Fgoogle-logo-2025.html&psig=AOvVaw3o2Se7Wh1FwpMFjrrOFjdk&ust=1749661581950000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNCgpbqr540DFQAAAAAdAAAAABAL",
    },
    {
      name: "Anthropic",
      slug: "anthropic",
      logo: "https://img.icons8.com/fluent/512/claude.png",
    },
  ];

  for (const company of companies) {
    await prisma.company.upsert({
      where: {
        slug: company.slug,
      },
      update: {},
      create: company,
    });
  }

  const models: {
    name: string;
    slug: string;
    logo: string;
    tag?: string;
    requiresPro?: boolean;
    credits?: number;
    pdfAnalysis?: boolean;
    imageAnalysis?: boolean;
    companyId: string;
    webAnalysis?: boolean;
    reasoning?: boolean;
  }[] = [
    {
      name: "Gemini 2.0 Flash",
      slug: "gemini-2.0-flash",
      logo: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.transparentpng.com%2Fcats%2Fgoogle-logo-2025.html&psig=AOvVaw3o2Se7Wh1FwpMFjrrOFjdk&ust=1749661581950000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNCgpbqr540DFQAAAAAdAAAAABAL",
      tag: "Fast",
      requiresPro: true,
      credits: 1,
      pdfAnalysis: true,
      imageAnalysis: true,
      webAnalysis: true,
      reasoning: true,
      companyId: "cmbqry1470001puke7yf8vd06",
    },
    {
      name: "Gemini 2.5 Pro",
      slug: "gemini-2.5-pro",
      logo: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.transparentpng.com%2Fcats%2Fgoogle-logo-2025.html&psig=AOvVaw3o2Se7Wh1FwpMFjrrOFjdk&ust=1749661581950000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNCgpbqr540DFQAAAAAdAAAAABAL",
      tag: "Pro",
      requiresPro: true,
      credits: 2,
      pdfAnalysis: true,
      imageAnalysis: true,
      webAnalysis: true,
      reasoning: true,
      companyId: "cmbqry1470001puke7yf8vd06",
    },
    {
      name: "Chat GPT 4o Mini",
      slug: "chat-gpt-4o-mini",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/1024px-ChatGPT-Logo.svg.png",
      tag: "Mini",
      credits: 0.25,
      requiresPro: false,
      pdfAnalysis: false,
      imageAnalysis: false,
      webAnalysis: false,
      reasoning: false,
      companyId: "cmbqry13y0000pukes6vvnpqn",
    },
  ];

  for (const model of models) {
    await prisma.aiModel.upsert({
      where: {
        slug: model.slug,
      },
      update: {},
      create: {
        ...model,
      },
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

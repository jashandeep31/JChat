"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WebSearch } from "@repo/db";

export const getWebSearches = async (
  answerId: string
): Promise<WebSearch[] | null> => {
  const session = await auth();
  if (!session?.user) return null;
  const webSearches = await db.webSearch.findMany({
    where: {
      chatQuestionAnswerId: answerId,
    },
  });
  return webSearches;
};

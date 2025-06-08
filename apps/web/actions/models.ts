"use server";

import { db } from "@/lib/db";

export const getModels = async () => {
  const models = await db.aiModel.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return models;
};

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const getApiKeys = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const apiKeys = await db.apiKey.findMany({
    where: {
      userId: session?.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return apiKeys;
};

export const createApiKey = async ({
  companyId,
  key,
  name,
}: {
  companyId: string;
  key: string;
  name: string;
}) => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const apiKey = await db.apiKey.create({
    data: {
      userId: session.user.id,
      companyId,
      key,
      name,
    },
  });
  return apiKey;
};

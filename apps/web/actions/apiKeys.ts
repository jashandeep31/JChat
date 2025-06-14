"use server";

import { auth } from "@/lib/auth";
import { db, redis } from "@/lib/db";
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
  const apiKeyKey = `api:${companyId}:${session.user.id}`;
  await redis.del(apiKeyKey);
  return apiKey;
};

export const deleteApiKey = async (id: string) => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const apiKey = await db.apiKey.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });
  const apiKeyKey = `api:${apiKey.companyId}:${apiKey.userId}`;
  await redis.del(apiKeyKey);
  return;
};

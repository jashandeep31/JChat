"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const getChats = async (projectId?: string) => {
  const session = await auth();
  if (!session?.user) return [];

  const chats = await db.chat.findMany({
    where: {
      userId: session.user.id,
      ...(projectId ? { projectId } : {}),
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return chats;
};

export const renameChat = async (id: string, name: string) => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await db.chat.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      name,
    },
  });
  return;
};

export const deleteChat = async (id: string) => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await db.chat.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });
  return;
};

export const moveChat = async (id: string, projectId: string) => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await db.chat.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      projectId,
    },
  });
  return;
};

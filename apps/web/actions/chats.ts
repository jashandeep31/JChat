"use server";

import { auth } from "@/lib/auth";
import { db, redis } from "@/lib/db";
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

  const chat = await db.chat.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      name,
    },
  });
  const key = `chat:${chat.id}`;
  await redis.set(key, JSON.stringify(chat), "EX", 60 * 20);
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
  const key = `chat:${id}`;
  await redis.del(key);
  return;
};

export const addChatInstruction = async (id: string, instruction: string) => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const chat = await db.chat.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      instruction,
    },
  });
  const key = `chat:${chat.id}`;
  await redis.set(key, JSON.stringify(chat), "EX", 60 * 20);
  return;
};
export const moveChat = async (id: string, projectId: string) => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const chat = await db.chat.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      projectId,
    },
  });
  const key = `chat:${chat.id}`;
  await redis.set(key, JSON.stringify(chat), "EX", 60 * 20);
  return;
};

export const getChat = async (id: string) => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const hit = await redis.get(`chat:${id}`);
  if (hit) return JSON.parse(hit);

  const chat = await db.chat.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });
  const key = `chat:${chat?.id}`;
  await redis.set(key, JSON.stringify(chat), "EX", 60 * 20);
  return chat;
};

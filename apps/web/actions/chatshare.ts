"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChatShareLink } from "@repo/db";

export const createChatShareLink = async (
  chatId: string
): Promise<ChatShareLink | 404> => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const chat = await db.chat.findUnique({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  });

  if (!chat) return 404;

  const chatShareLink = await db.chatShareLink.create({
    data: {
      chatId,
      userId: session.user.id,
    },
  });

  return chatShareLink;
};

export const deleteChatShareLink = async (linkId: string) => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await db.chatShareLink.delete({
    where: {
      id: linkId,
      userId: session.user.id,
    },
  });
  return;
};
export const getChatShareLinks = async (
  chatId: string
): Promise<ChatShareLink[]> => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const chatShareLinks = await db.chatShareLink
    .findMany({
      where: {
        chatId,
        userId: session.user.id,
      },
    })
    .catch(() => {
      return [];
    });

  return chatShareLinks;
};

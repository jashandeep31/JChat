"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getChat } from "./chats";
import { ChatQuestion, ChatQuestionAnswer } from "@prisma/client";

interface FullQuestion extends ChatQuestion {
  ChatQuestionAnswer: ChatQuestionAnswer[];
}

export const getQAPairs = async (
  chatId: string
): Promise<Array<FullQuestion>> => {
  const session = await auth();
  if (!session?.user) return [];
  const chat = await getChat(chatId);
  if (!chat || chat.userId !== session.user.id) {
    return [];
  }
  const qaParis = await db.chatQuestion
    .findMany({
      where: {
        chatId,
      },
      include: {
        ChatQuestionAnswer: {
          include: {
            WebSearch: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    .catch(() => {
      return [];
    });
  return qaParis;
};

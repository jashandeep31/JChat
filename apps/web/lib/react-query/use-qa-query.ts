"use client";
import { useQuery } from "@tanstack/react-query";
import { getQAPairs } from "@/actions/chatqa";
import { ChatQuestion, ChatQuestionAnswer } from "@prisma/client";

export const useChatQAPairsQuery = (chatId: string) => {
  return useQuery<
    Array<ChatQuestion & { ChatQuestionAnswer: ChatQuestionAnswer[] }>
  >({
    queryKey: ["qa-pair", chatId],
    queryFn: () => getQAPairs(chatId),
    enabled: !!chatId,
  });
};

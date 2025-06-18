"use client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { getQAPairs } from "@/actions/chatqa";
import { ChatQuestion, ChatQuestionAnswer } from "@prisma/client";

export const useChatQAPairsQuery = (chatId: string) => {
  return useQuery<
    Array<ChatQuestion & { ChatQuestionAnswer: ChatQuestionAnswer[] }>
  >({
    queryKey: ["qa-pair", chatId],
    queryFn: async () => await getQAPairs(chatId),
    enabled: !!chatId,
  });
};

export const useChatQAPairsQueryNew = (
  chatId: string,
  options: Omit<
    UseQueryOptions<
      Array<ChatQuestion & { ChatQuestionAnswer: ChatQuestionAnswer[] }>,
      Error,
      Array<ChatQuestion & { ChatQuestionAnswer: ChatQuestionAnswer[] }>,
      string[]
    >,
    "queryKey" | "queryFn"
  > = {}
): UseQueryResult<
  Array<ChatQuestion & { ChatQuestionAnswer: ChatQuestionAnswer[] }>,
  Error
> => {
  const effectiveChatId = chatId;

  return useQuery<
    Array<ChatQuestion & { ChatQuestionAnswer: ChatQuestionAnswer[] }>,
    Error,
    Array<ChatQuestion & { ChatQuestionAnswer: ChatQuestionAnswer[] }>,
    string[]
  >({
    queryKey: ["qa-pair", effectiveChatId],
    queryFn: async () => await getQAPairs(effectiveChatId),
    enabled: Boolean(effectiveChatId) && (options.enabled ?? true),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

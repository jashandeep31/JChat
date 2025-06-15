"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createChatShareLink,
  getChatShareLinks as fetchChatShareLinks,
  deleteChatShareLink as deleteChatShareLinkAction,
} from "@/actions/chatshare";
import { ChatShareLink } from "@repo/db";

export const useChatShareQuery = (chatId: string) => {
  const queryClient = useQueryClient();

  const getChatShareLinksQuery = useQuery<ChatShareLink[]>({
    queryKey: ["chat-share-links", chatId],
    queryFn: () => fetchChatShareLinks(chatId),
    enabled: !!chatId,
  });

  const createChatShareLinkMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const result = await createChatShareLink(chatId);
      if (result === 404) {
        throw new Error("Chat not found");
      }
      return result;
    },
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-share-links", chatId],
      });
    },
  });

  const deleteChatShareLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      await deleteChatShareLinkAction(linkId);
      return linkId;
    },
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-share-links", chatId],
      });
      toast.success("Share link deleted");
    },
    onError: () => {
      toast.error("Failed to delete share link");
    },
  });

  return {
    getChatShareLinksQuery,
    createChatShareLinkMutation,
    deleteChatShareLinkMutation,
  };
};

export const useChatShareLinksQuery = (chatId: string) => {
  const { getChatShareLinksQuery } = useChatShareQuery(chatId);
  return getChatShareLinksQuery;
};

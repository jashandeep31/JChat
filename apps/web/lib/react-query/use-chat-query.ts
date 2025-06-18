"use client";
import {
  addChatInstruction,
  getChat,
  getChats,
  moveChat,
  renameChat,
} from "@/actions/chats";
import { Chat } from "@repo/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteChat } from "@/actions/chats";

const useChatQuery = () => {
  const queryClient = useQueryClient();

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const chats = await getChats();
      return chats;
    },
    staleTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const updateChatName = (chat: Chat) => {
    queryClient.setQueryData<Chat[]>(["chats"], (oldData) => {
      if (!oldData) return oldData;
      const existingChatIndex = oldData.findIndex((c) => c.id === chat.id);
      if (existingChatIndex !== -1) {
        const updatedData = [...oldData];
        updatedData[existingChatIndex] = {
          ...oldData[existingChatIndex],
          name: chat.name,
        };
        return updatedData;
      }
      return oldData;
    });
  };

  const appendChat = (chat: Chat) => {
    queryClient.setQueryData<Chat[]>(["chats"], (oldData) => {
      if (!oldData) return oldData;
      const existingChatIndex = oldData.findIndex((c) => c.id === chat.id);
      if (existingChatIndex !== -1) {
        oldData[existingChatIndex] = chat;
        return [...oldData];
      }
      return [chat, ...oldData];
    });
  };

  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      return await deleteChat(chatId);
    },
  });

  const renameChatMutation = useMutation({
    mutationFn: async ({ chatId, name }: { chatId: string; name: string }) => {
      return await renameChat(chatId, name);
    },
  });

  const moveChatMutation = useMutation({
    mutationFn: async ({
      chatId,
      projectId,
    }: {
      chatId: string;
      projectId: string;
    }) => {
      return await moveChat(chatId, projectId);
    },
  });

  const addChatIntructionMutation = useMutation({
    mutationFn: async ({
      chatId,
      instruction,
    }: {
      chatId: string;
      instruction: string;
    }) => {
      return await addChatInstruction(chatId, instruction);
    },
  });

  return {
    chatsQuery,
    updateChatName,
    appendChat,
    deleteChatMutation,
    renameChatMutation,
    moveChatMutation,
    addChatIntructionMutation,
  };
};

export const getChatQuery = (chatId: string) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      return await getChat(chatId);
    },
  });
};
export default useChatQuery;

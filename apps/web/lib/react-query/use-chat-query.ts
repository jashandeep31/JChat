import { getChats, renameChat } from "@/actions/chats";
import { Chat } from "@repo/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteChat } from "@/actions/chats";

const useChatQuery = () => {
  const queryClient = useQueryClient();

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      return await getChats();
    },
    staleTime: 5 * 60 * 1000, //5min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    onSuccess: () => {
      chatsQuery.refetch();
    },
  });

  const renameChatMutation = useMutation({
    mutationFn: async ({ chatId, name }: { chatId: string; name: string }) => {
      return await renameChat(chatId, name);
    },
    onSuccess: () => {
      chatsQuery.refetch();
    },
  });
  return {
    chatsQuery,
    updateChatName,
    appendChat,
    deleteChatMutation,
    renameChatMutation,
  };
};

export default useChatQuery;

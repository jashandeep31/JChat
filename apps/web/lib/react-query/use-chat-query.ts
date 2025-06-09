import { getChats } from "@/actions/chats";
import { Chat } from "@repo/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

  return { chatsQuery, updateChatName, appendChat };
};

export default useChatQuery;

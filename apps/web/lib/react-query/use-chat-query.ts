import { getChats } from "@/actions/chats";
import { useQuery } from "@tanstack/react-query";

const useChatQuery = () => {
  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      return await getChats();
    },
    staleTime: 5 * 60 * 1000, //5min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  return { chatsQuery };
};

export default useChatQuery;

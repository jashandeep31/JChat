"use client";
import { getWebSearches } from "@/actions/websearch";
import { useQuery } from "@tanstack/react-query";

const useWebSearchQuery = (id: string) => {
  const getWebSearchesQuery = useQuery({
    queryKey: ["websearch", id],
    queryFn: async () => {
      return await getWebSearches(id);
    },
    staleTime: 5 * 60 * 1000, //5min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return getWebSearchesQuery;
};

export default useWebSearchQuery;

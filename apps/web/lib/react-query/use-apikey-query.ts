"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createApiKey, deleteApiKey, getApiKeys } from "@/actions/apiKeys";
const useApiKeyQuery = () => {
  const apiKeysQuery = useQuery({
    queryKey: ["apiKeys"],
    queryFn: async () => {
      return await getApiKeys();
    },
    staleTime: 5 * 60 * 1000, //5min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteApiKey(id);
    },
    onSuccess: () => {
      apiKeysQuery.refetch();
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async ({
      companyId,
      key,
      name,
    }: {
      companyId: string;
      key: string;
      name: string;
    }) => {
      return await createApiKey({ companyId, key, name });
    },
    onSuccess: () => {
      apiKeysQuery.refetch();
    },
  });

  return { apiKeysQuery, createApiKeyMutation, deleteApiKeyMutation };
};
export default useApiKeyQuery;

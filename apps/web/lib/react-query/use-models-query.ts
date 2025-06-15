"use client";
import { getModels } from "@/actions/models";
import { useQuery } from "@tanstack/react-query";

const useModelsQuery = () => {
  const modelsQuery = useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const models = await getModels();
      return models;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  return { modelsQuery };
};

export default useModelsQuery;

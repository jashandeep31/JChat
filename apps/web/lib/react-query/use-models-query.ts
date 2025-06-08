import { getModels } from "@/actions/models";
import { useQuery } from "@tanstack/react-query";

const useModelsQuery = () => {
  const modelsQuery = useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      return await getModels();
    },
    staleTime: 5 * 60 * 1000, //5min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  return { modelsQuery };
};

export default useModelsQuery;

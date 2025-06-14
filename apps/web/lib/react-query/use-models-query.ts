import { getModels } from "@/actions/models";
import { useQuery } from "@tanstack/react-query";

const useModelsQuery = () => {
  const modelsQuery = useQuery({
    queryKey: ["models"],
    initialData: JSON.parse(localStorage.getItem("models") || "[]"),
    queryFn: async () => {
      const models = await getModels();
      localStorage.setItem("models", JSON.stringify(models));
      return models;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  return { modelsQuery };
};

export default useModelsQuery;

import { getCompanies } from "@/actions/company";
import { useQuery } from "@tanstack/react-query";

const useCompanyQuery = () => {
  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      return await getCompanies();
    },
    staleTime: 5 * 60 * 1000, //5min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  return { companiesQuery };
};

export default useCompanyQuery;

import { getCompanies } from "@/actions/company";
import { useQuery } from "@tanstack/react-query";

const useCompanyQuery = () => {
  const companiesQuery = useQuery({
    queryKey: ["companies"],
    initialData: JSON.parse(localStorage.getItem("companies") || "[]"),
    queryFn: async () => {
      const companies = await getCompanies();
      localStorage.setItem("companies", JSON.stringify(companies));
      return companies;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
  return { companiesQuery };
};

export default useCompanyQuery;

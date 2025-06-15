"use client";
import { getCompanies } from "@/actions/company";
import { useQuery } from "@tanstack/react-query";

const useCompanyQuery = () => {
  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const companies = await getCompanies();
      return companies;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
  return { companiesQuery };
};

export default useCompanyQuery;

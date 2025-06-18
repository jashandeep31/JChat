"use client";
import { getUser } from "@/actions/user";
import { useQuery } from "@tanstack/react-query";
import { User } from "@repo/db";

const useUserQuery = () => {
  const userQuery = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await getUser();
      return user;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  return { userQuery };
};
export default useUserQuery;

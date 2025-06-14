import { getUser } from "@/actions/user";
import { useQuery } from "@tanstack/react-query";

const useUserQuery = () => {
  const userQuery = useQuery({
    initialData: JSON.parse(localStorage.getItem("user") || "null"),
    queryKey: ["user"],
    queryFn: async () => {
      const user = await getUser();
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
  return { userQuery };
};
export default useUserQuery;

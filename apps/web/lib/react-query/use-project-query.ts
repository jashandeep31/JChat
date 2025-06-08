import { createProject, getProjects } from "@/actions/projects";
import { useMutation, useQuery } from "@tanstack/react-query";

const useProjectQuery = () => {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return await getProjects();
    },
    staleTime: 5 * 60 * 1000, //5min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      return await createProject({ name });
    },
    onSuccess: () => {
      projectsQuery.refetch();
    },
  });

  return { projectsQuery, createProjectMutation };
};

export default useProjectQuery;

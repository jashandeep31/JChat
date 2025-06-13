import { getChats } from "@/actions/chats";
import {
  addInstructionToProject,
  createProject,
  getProjects,
} from "@/actions/projects";
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

  const updateProjectMutation = useMutation({
    mutationFn: async (project: { id: string; instruction: string }) => {
      return await addInstructionToProject({
        id: project.id,
        instruction: project.instruction,
      });
    },
    onSuccess: () => {
      projectsQuery.refetch();
    },
  });
  return { projectsQuery, createProjectMutation, updateProjectMutation };
};

export default useProjectQuery;

export const useProjectChats = (projectId?: string) =>
  useQuery({
    queryKey: ["project-chats", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return await getChats(projectId);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!projectId,
  });

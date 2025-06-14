import { getChats } from "@/actions/chats";
import {
  addInstructionToProject,
  createProject,
  deleteProject,
  getProjects,
  updateProjectName,
} from "@/actions/projects";
import { useMutation, useQuery } from "@tanstack/react-query";

const useProjectQuery = () => {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    initialData: JSON.parse(localStorage.getItem("projects") || "[]"),
    queryFn: async () => {
      const projects = await getProjects();
      localStorage.setItem("projects", JSON.stringify(projects));
      return projects;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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
    mutationFn: async (project: {
      id: string;
      instruction?: string;
      name?: string;
    }) => {
      if (project.instruction !== undefined) {
        return await addInstructionToProject({
          id: project.id,
          instruction: project.instruction,
        });
      } else if (project.name !== undefined) {
        return await updateProjectName({
          id: project.id,
          name: project.name,
        });
      }
      throw new Error("Either instruction or name must be provided");
    },
    onSuccess: () => {
      projectsQuery.refetch();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteProject(id);
    },
    onSuccess: () => {
      projectsQuery.refetch();
    },
  });

  return {
    projectsQuery,
    createProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
  };
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

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "@repo/ui/components/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import {
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  FolderPen,
  Lightbulb,
  Loader,
} from "lucide-react";
import React, { useState } from "react";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Button } from "@repo/ui/components/button";
import useProjectQuery from "@/lib/react-query/use-project-query";
import { useRouter, useParams } from "next/navigation";
import { Project } from "@repo/db";
import { useSession } from "next-auth/react";
import { useChatsStore } from "@/z-store/chats-store";

const SidebarProjects = () => {
  const router = useRouter();
  const params = useParams();
  const session = useSession();
  const [createProjectDialogState, setCreateProjectDialogState] =
    useState(false);
  const { projectsQuery } = useProjectQuery();
  const [expandedProjects, setExpandedProjects] = useState<
    Record<string, boolean>
  >({});

  React.useEffect(() => {
    const projectId = params?.pid;
    if (projectId && typeof projectId === "string") {
      setExpandedProjects((prev) => ({
        ...prev,
        [projectId]: true,
      }));
    }
  }, [params?.pid]);

  const toggleProjectExpansion = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };
  if (!session.data) {
    return null;
  }
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center justify-between">
          <span>Projects</span>
          {projectsQuery.isLoading ? (
            <Loader className="animate-spin w-3 h-3" />
          ) : null}
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuButton onClick={() => setCreateProjectDialogState(true)}>
            <FolderPen /> <span> New Project</span>
          </SidebarMenuButton>

          {projectsQuery.data?.map((project: Project) => (
            <div key={project.id} className="flex flex-col">
              <SidebarMenuButton
                className="flex items-center justify-between pr-2"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="flex items-center">
                  {expandedProjects[project.id] ? (
                    <FolderOpen className="shrink-0 w-4 h-4" />
                  ) : (
                    <FolderClosed className="shrink-0 w-4 h-4" />
                  )}
                  <span className="ml-2">{project.name}</span>
                </div>
                <button
                  onClick={(e) => toggleProjectExpansion(project.id, e)}
                  className="p-1 hover:bg-accent rounded-sm"
                >
                  {expandedProjects[project.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </SidebarMenuButton>

              {expandedProjects[project.id] && (
                <ProjectChats projectId={project.id} />
              )}
            </div>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <CreateProjectDialog
        open={createProjectDialogState}
        onOpenChange={setCreateProjectDialogState}
      />
    </>
  );
};

const ProjectChats = ({ projectId }: { projectId: string }) => {
  const { chats } = useChatsStore();
  const filteredChats = chats.filter((chat) => chat.projectId === projectId);
  const router = useRouter();

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  if (!filteredChats || filteredChats.length === 0) {
    return (
      <div className="pl-8 py-1 text-xs text-muted-foreground">
        No chats found
      </div>
    );
  }

  return (
    <div className="pl-6">
      {filteredChats.map((chat) => (
        <SidebarMenuButton
          key={chat.id}
          onClick={() => handleChatClick(chat.id)}
          className="text-sm py-1"
        >
          <span className="ml-2 truncate">{chat.name || "Untitled Chat"}</span>
        </SidebarMenuButton>
      ))}
    </div>
  );
};

export default SidebarProjects;

const CreateProjectDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { createProjectMutation } = useProjectQuery();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreateProject = () => {
    if (!name) {
      setError("Project name is required");
      return;
    }
    if (name.length < 3) {
      setError("Project name must be at least 3 characters long");
      return;
    }
    createProjectMutation.mutate(name, {
      onError: (error) => {
        setError(error.message);
      },
      onSuccess: () => {
        onOpenChange(false);
        setName("");
        setError(null);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <Label className="block mb-1" htmlFor="project_name">
            Project Name
          </Label>
          <Input
            id="project_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error ? <p className="text-red-500 mt-1 text-sm">{error}</p> : null}
        </div>
        <Alert variant="default" className="border-0 bg-accent">
          <Lightbulb />
          <AlertTitle>What&apos;s a project?</AlertTitle>
          <AlertDescription>
            Projects keep chats, files, and custom instructions in one place.
            Use them for ongoing work, or just to keep things tidy.
          </AlertDescription>
        </Alert>
        <div className="mt-0 flex gap-2 justify-end">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={createProjectMutation.isPending || !name}
            onClick={handleCreateProject}
          >
            {createProjectMutation.isPending ? (
              <Loader className="animate-spin" />
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

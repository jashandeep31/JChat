"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Project } from "@repo/db";

import useProjectQuery, { useProjectChats } from "@/lib/react-query/use-project-query";
import useChatQuery from "@/lib/react-query/use-chat-query";
import ChatInputBox from "../chat-input-box";
import DeleteDialog from "../delete-dialog";
import RenameDialog from "../rename-dialog";
import MoveToProjectDialog from "../move-to-project-dialog";

// Import our new modular components
import ProjectHeader from "./project-header";
import ProjectInstruction from "./project-instruction";
import ProjectChatsList from "./project-chats-list";
import ProjectInstructionDialog from "./project-instruction-dialog";
import RenameProjectDialog from "./project-rename-dialog";
import DeleteProjectDialog from "./project-delete-dialog";

const ProjectViewContainer = ({ project }: { project: Project }) => {
  const router = useRouter();
  const { data: chats } = useProjectChats(project.id);
  const { deleteProjectMutation, updateProjectMutation } = useProjectQuery();
  const { deleteChatMutation, renameChatMutation, moveChatMutation } = useChatQuery();
  
  // Project state
  const [instructionDialogState, setInstructionDialogState] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  
  // Chat management state
  const [isChatRenameDialogOpen, setIsChatRenameDialogOpen] = useState(false);
  const [isChatDeleteDialogOpen, setIsChatDeleteDialogOpen] = useState(false);
  const [isChatMoveDialogOpen, setIsChatMoveDialogOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<{id: string; name: string} | null>(null);
  const [newChatName, setNewChatName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  
  // Handle project rename click
  const handleRenameClick = () => {
    setNewProjectName(project.name);
    setIsRenameDialogOpen(true);
  };
  
  // Handle project delete click
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };
  
  // Chat management handlers
  const handleChatRenameClick = (chat: { id: string; name: string }) => {
    setCurrentChat(chat);
    setNewChatName(chat.name);
    setIsChatRenameDialogOpen(true);
  };

  const handleChatDeleteClick = (chat: { id: string; name: string }) => {
    setCurrentChat(chat);
    setIsChatDeleteDialogOpen(true);
  };

  const handleChatMoveClick = (chat: { id: string; name: string }) => {
    setCurrentChat(chat);
    setSelectedProjectId(""); // Reset selected project
    setIsChatMoveDialogOpen(true);
  };

  const handleChatRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChat || !newChatName.trim()) return;

    const toastId = toast.loading("Renaming chat...");
    renameChatMutation.mutate(
      { chatId: currentChat.id, name: newChatName },
      {
        onSuccess: () => {
          toast.success("Chat renamed successfully", { id: toastId });
          setIsChatRenameDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to rename chat", { id: toastId });
        },
      }
    );
  };

  const handleChatDelete = () => {
    if (!currentChat) return;

    const toastId = toast.loading("Deleting chat...");
    deleteChatMutation.mutate(currentChat.id, {
      onSuccess: () => {
        toast.success("Chat deleted successfully", { id: toastId });
        setIsChatDeleteDialogOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete chat", { id: toastId });
      },
    });
  };

  const handleChatMove = () => {
    if (!currentChat || !selectedProjectId) return;

    const toastId = toast.loading("Moving chat...");
    moveChatMutation.mutate(
      {
        chatId: currentChat.id,
        projectId: selectedProjectId,
      },
      {
        onSuccess: () => {
          toast.success("Chat moved successfully", { id: toastId });
          setIsChatMoveDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to move chat", { id: toastId });
        },
      }
    );
  };
  
  // Handle rename submit
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    const toastId = toast.loading("Renaming project...");
    updateProjectMutation.mutate(
      {
        id: project.id,
        name: newProjectName,
      },
      {
        onSuccess: () => {
          toast.success("Project renamed successfully", { id: toastId });
          setIsRenameDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to rename project", { id: toastId });
        },
      }
    );
  };
  
  // Handle delete project
  const handleDeleteProject = () => {
    const toastId = toast.loading("Deleting project...");
    deleteProjectMutation.mutate(project.id, {
      onSuccess: () => {
        toast.success("Project deleted successfully", { id: toastId });
        setIsDeleteDialogOpen(false);
        router.push("/");
      },
      onError: () => {
        toast.error("Failed to delete project", { id: toastId });
      },
    });
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center flex-col py-12">
        <ProjectHeader 
          projectName={project.name}
          onRenameClick={handleRenameClick}
          onDeleteClick={handleDeleteClick}
        />
        
        <div className="mt-6 lg:min-w-[800px]">
          <ChatInputBox />
          <div className="mt-6">
            <ProjectInstruction
              instruction={project.instruction}
              onOpenInstructionDialog={() => setInstructionDialogState(true)}
            />
          </div>
          
          {/* Project-related dialogs */}
          <ProjectInstructionDialog
            open={instructionDialogState}
            onOpenChange={setInstructionDialogState}
            projectId={project.id}
            projectInstruction={project.instruction}
          />
          
          <RenameProjectDialog
            open={isRenameDialogOpen}
            onOpenChange={setIsRenameDialogOpen}
            projectName={newProjectName}
            setProjectName={setNewProjectName}
            onSubmit={handleRenameSubmit}
            isLoading={updateProjectMutation.isPending}
          />
          
          <DeleteProjectDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            projectName={project.name}
            onDelete={handleDeleteProject}
            isLoading={deleteProjectMutation.isPending}
          />
          
          {/* Chat-related dialogs */}
          {currentChat && (
            <>
              <RenameDialog
                open={isChatRenameDialogOpen}
                onOpenChange={setIsChatRenameDialogOpen}
                chatName={newChatName}
                onChatNameChange={setNewChatName}
                onSubmit={handleChatRenameSubmit}
              />
              
              <DeleteDialog
                open={isChatDeleteDialogOpen}
                onOpenChange={setIsChatDeleteDialogOpen}
                onDelete={handleChatDelete}
                isLoading={deleteChatMutation.isPending}
              />
              
              <MoveToProjectDialog
                open={isChatMoveDialogOpen}
                onOpenChange={setIsChatMoveDialogOpen}
                chatName={currentChat.name}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                onSubmit={handleChatMove}
                isLoading={moveChatMutation.isPending}
              />
            </>
          )}

          {/* Chats List */}
          <ProjectChatsList
            chats={chats}
            onChatRenameClick={handleChatRenameClick}
            onChatMoveClick={handleChatMoveClick}
            onChatDeleteClick={handleChatDeleteClick}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectViewContainer;

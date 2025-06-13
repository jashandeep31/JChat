"use client";
import { Project } from "@repo/db";
import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { Input } from "@repo/ui/components/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Lightbulb, Loader, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import ChatInputBox from "../chat-input-box";
import useProjectQuery, {
  useProjectChats,
} from "@/lib/react-query/use-project-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ProjectView = ({ project }: { project: Project }) => {
  const router = useRouter();
  const { data: chats } = useProjectChats(project.id);
  const { deleteProjectMutation, updateProjectMutation } = useProjectQuery();
  
  const [instructionDialogState, setInstructionDialogState] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  
  // Handle rename click
  const handleRenameClick = () => {
    setNewProjectName(project.name);
    setIsRenameDialogOpen(true);
  };
  
  // Handle delete click
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRenameClick}>
                <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteClick}>
                <Trash2 className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-6 lg:min-w-[800px]">
          <ChatInputBox />
          <div className="mt-6">
            <Alert variant="default" className="border-0 bg-accent">
              <Lightbulb />
              <AlertTitle>
                {project.instruction ? "Project" : "Add"} Instruction
              </AlertTitle>
              <AlertDescription>
                {project.instruction ? (
                  <p>{project.instruction}</p>
                ) : (
                  <p>
                    Add instruction to project to allow AI to keep responses
                    related to your project
                  </p>
                )}
                <div className="mt-2">
                  <Button
                    variant={"ghost"}
                    onClick={() => setInstructionDialogState(true)}
                  >
                    <Plus /> {project.instruction ? "Edit" : "Add"} Instruction
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Dialogs */}
          <AddInstructionDialog
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

          <div className="mt-12 w-full">
            <h2 className="text-xl">Chats</h2>
            <div className="mt-3">
              {chats?.map((chat) => (
                <Link
                  href={`/chat/${chat.id}`}
                  key={chat.id}
                  className="flex items-center border p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-base mb-2 font-medium">{chat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {chat.updatedAt.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddInstructionDialog = ({
  open,
  onOpenChange,
  projectId,
  projectInstruction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectInstruction: string | null;
}) => {
  const [instruction, setInstruction] = useState(projectInstruction || "");
  const { updateProjectMutation } = useProjectQuery();

  const handleSave = () => {
    updateProjectMutation.mutate({
      id: projectId,
      instruction,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Add Instruction</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          <Label className="block mb-2 text-base" htmlFor="project_instruction">
            Project Instruction
          </Label>
          <Textarea
            id="project_instruction"
            value={instruction}
            placeholder="Add instruction to project to allow AI to keep responses related to your project"
            className="min-h-[200px]"
            onChange={(e) => setInstruction(e.target.value)}
          />
        </div>
        <div className="mt-0 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={updateProjectMutation.isPending}
          >
            Save{" "}
            {updateProjectMutation.isPending ? (
              <Loader className="animate-spin" />
            ) : null}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const RenameProjectDialog = ({
  open,
  onOpenChange,
  projectName,
  setProjectName,
  onSubmit,
  isLoading,
}: RenameProjectDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !projectName.trim()}>
              {isLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onDelete: () => void;
  isLoading: boolean;
}

const DeleteProjectDialog = ({
  open,
  onOpenChange,
  projectName,
  onDelete,
  isLoading,
}: DeleteProjectDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{projectName}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectView;

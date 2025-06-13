"use client";
import { Project } from "@repo/db";
import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { Lightbulb, Loader, Plus } from "lucide-react";
import ChatInputBox from "../chat-input-box";
import useProjectQuery, {
  useProjectChats,
} from "@/lib/react-query/use-project-query";
import Link from "next/link";

const ProjectView = ({ project }: { project: Project }) => {
  const { data: chats } = useProjectChats(project.id);
  const [instructionDialogState, setInstructionDialogState] = useState(false);
  return (
    <div className="p-4">
      <div className="flex items-center flex-col py-12">
        <h1 className="text-2xl font-bold">{project.name}</h1>
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
                    Add instruction to project to allow ai to keeps respnse
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
          <AddInstructionDialog
            open={instructionDialogState}
            onOpenChange={setInstructionDialogState}
            projectId={project.id}
            projectInstruction={project.instruction}
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
            placeholder="Add instruction to project to allow ai to keeps respnse related to your project"
            className="min-h-[200px]"
            onChange={(e) => setInstruction(e.target.value)}
          />
        </div>
        <div className="mt-0 flex gap-2 justify-end">
          <Button variant="outline">Cancel</Button>
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

export default ProjectView;

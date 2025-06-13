"use client";
import { Lightbulb, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";

interface ProjectInstructionProps {
  instruction: string | null;
  onOpenInstructionDialog: () => void;
}

const ProjectInstruction = ({
  instruction,
  onOpenInstructionDialog
}: ProjectInstructionProps) => {
  return (
    <Alert variant="default" className="border-0 bg-accent">
      <Lightbulb />
      <AlertTitle>
        {instruction ? "Project" : "Add"} Instruction
      </AlertTitle>
      <AlertDescription>
        {instruction ? (
          <p>{instruction}</p>
        ) : (
          <p>
            Add instruction to project to allow AI to keep responses
            related to your project
          </p>
        )}
        <div className="mt-2">
          <Button
            variant="ghost"
            onClick={onOpenInstructionDialog}
          >
            <Plus /> {instruction ? "Edit" : "Add"} Instruction
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ProjectInstruction;

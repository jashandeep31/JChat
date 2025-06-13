"use client";
import { useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import useProjectQuery from "@/lib/react-query/use-project-query";

interface ProjectInstructionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectInstruction: string | null;
}

const ProjectInstructionDialog = ({
  open,
  onOpenChange,
  projectId,
  projectInstruction,
}: ProjectInstructionDialogProps) => {
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
      <DialogContent>
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

export default ProjectInstructionDialog;

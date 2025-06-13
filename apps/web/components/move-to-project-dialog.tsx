import useProjectQuery from "@/lib/react-query/use-project-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Button } from "@repo/ui/components/button";

export interface MoveToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatName: string;
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const MoveToProjectDialog = ({
  open,
  onOpenChange,
  chatName,
  selectedProjectId,
  onSelectProject,
  onSubmit,
  isLoading,
}: MoveToProjectDialogProps) => {
  const { projectsQuery } = useProjectQuery();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Chat to Project</DialogTitle>
          <DialogDescription>
            Select a project to move &quot;{chatName}&quot; to.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedProjectId} onValueChange={onSelectProject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projectsQuery.data?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!selectedProjectId || isLoading}>
            {isLoading ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveToProjectDialog;

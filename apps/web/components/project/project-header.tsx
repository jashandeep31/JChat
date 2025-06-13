"use client";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

interface ProjectHeaderProps {
  projectName: string;
  onRenameClick: () => void;
  onDeleteClick: () => void;
}

const ProjectHeader = ({ 
  projectName, 
  onRenameClick, 
  onDeleteClick 
}: ProjectHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold">{projectName}</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRenameClick}>
            <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDeleteClick}>
            <Trash2 className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProjectHeader;

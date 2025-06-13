"use client";
import { MoreHorizontal, Pencil, Trash2, FolderCheck, Share } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { type Chat } from "@repo/db";

interface ProjectChatsListProps {
  chats: Chat[] | undefined;
  onChatRenameClick: (chat: { id: string; name: string }) => void;
  onChatMoveClick: (chat: { id: string; name: string }) => void;
  onChatDeleteClick: (chat: { id: string; name: string }) => void;
  onChatShareClick: (chat: { id: string; name: string }) => void;
}

const ProjectChatsList = ({
  chats,
  onChatRenameClick,
  onChatMoveClick,
  onChatDeleteClick,
  onChatShareClick,
}: ProjectChatsListProps) => {
  return (
    <div className="mt-12 w-full">
      <h2 className="text-xl">Chats</h2>
      <div className="mt-3">
        {chats?.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center border p-2 rounded-md hover:bg-accent transition-colors relative"
          >
            <Link
              href={`/chat/${chat.id}`}
              className="flex-1"
            >
              <div>
                <p className="text-base mb-2 font-medium">{chat.name}</p>
                <p className="text-xs text-muted-foreground">
                  {chat.updatedAt.toLocaleString()}
                </p>
              </div>
            </Link>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onChatRenameClick(chat)}>
                    <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChatShareClick(chat)}>
                    <Share className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChatMoveClick(chat)}>
                    <FolderCheck className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Move to Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onChatDeleteClick(chat)}>
                    <Trash2 className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectChatsList;

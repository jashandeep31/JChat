import { useState } from "react";
import useChatQuery from "@/lib/react-query/use-chat-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import {
  FolderCheck,
  GitBranch,
  MoreHorizontal,
  Pencil,
  Share,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteDialog from "./delete-dialog";
import RenameDialog from "./rename-dialog";
import MoveToProjectDialog from "./move-to-project-dialog";
import ShareDialog from "./share-dialog";

const SidebarChats = () => {
  const params = useParams();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const {
    chatsQuery,
    deleteChatMutation,
    renameChatMutation,
    moveChatMutation,
  } = useChatQuery();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newChatName, setNewChatName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const handleDeleteClick = (chat: { id: string; name: string }) => {
    setCurrentChat(chat);
    setIsDeleteDialogOpen(true);
  };

  const handleMoveClick = (chat: { id: string; name: string }) => {
    setCurrentChat(chat);
    setSelectedProjectId("");
    setIsMoveDialogOpen(true);
  };

  const handleShareClick = (chat: { id: string; name: string }) => {
    setCurrentChat(chat);
    setIsShareDialogOpen(true);
  };

  const handleDeleteChat = () => {
    if (!currentChat) return;

    if (params.cid === currentChat.id) {
      router.push("/");
    }

    const toastId = toast.loading("Deleting chat...");
    deleteChatMutation.mutate(currentChat.id, {
      onSuccess: () => {
        chatsQuery.refetch();
        toast.success("Chat deleted successfully", { id: toastId });
        setIsDeleteDialogOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete chat", { id: toastId });
      },
    });
  };

  const handleRenameClick = (chat: { id: string; name: string }) => {
    setCurrentChat(chat);
    setNewChatName(chat.name);
    setIsRenameDialogOpen(true);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChat || !newChatName.trim()) return;
    const toastId = toast.loading("Renaming chat...");
    renameChatMutation.mutate(
      {
        chatId: currentChat.id,
        name: newChatName,
      },
      {
        onSuccess: () => {
          toast.success("Chat renamed successfully", { id: toastId });
          setIsRenameDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to rename chat", { id: toastId });
        },
      }
    );
  };

  const handleMoveSubmit = () => {
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
          setIsMoveDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to move chat", { id: toastId });
        },
      }
    );
  };

  return (
    <>
      <RenameDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        chatName={newChatName}
        onChatNameChange={setNewChatName}
        onSubmit={handleRenameSubmit}
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteChat}
        isLoading={deleteChatMutation.isPending}
      />

      <MoveToProjectDialog
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        chatName={currentChat?.name || ""}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onSubmit={handleMoveSubmit}
        isLoading={moveChatMutation.isPending}
      />

      {currentChat && (
        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          chatId={currentChat.id}
        />
      )}

      <SidebarGroup>
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SidebarMenu>
          {chatsQuery.data?.map((chat) => (
            <SidebarMenuItem
              key={chat.id}
              className="hover:bg-accent rounded-md"
            >
              <SidebarMenuButton className="flex items-center gap-2">
                <Link
                  href={`/chat/${chat.id}`}
                  className="truncate overflow-hidden max-w-full flex items-center gap-2"
                >
                  <div className="flex items-center gap-2 ">
                    {chat.type === "BRANCHED" && (
                      <GitBranch className="w-4 h-4" />
                    )}
                    {chat.name}
                  </div>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem onClick={() => handleRenameClick(chat)}>
                    <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShareClick(chat)}>
                    <Share className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMoveClick(chat)}>
                    <FolderCheck className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Move to Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDeleteClick(chat)}>
                    <Trash2 className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
};

export default SidebarChats;

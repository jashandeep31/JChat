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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
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

const SidebarChats = () => {
  const params = useParams();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { chatsQuery, deleteChatMutation, renameChatMutation } = useChatQuery();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newChatName, setNewChatName] = useState("");

  const handleDeleteClick = (chat: { id: string; name: string }) => {
    setCurrentChat(chat);
    setIsDeleteDialogOpen(true);
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

  return (
    <>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>Rename Chat</DialogTitle>
              <DialogDescription>
                Enter a new name for this chat.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                placeholder="Chat name"
                className="w-full"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRenameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChat}
              disabled={deleteChatMutation.isPending}
            >
              {deleteChatMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <DropdownMenuItem>
                    <Share className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
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

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Link2, Trash2, Copy, PlusCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  useChatShareLinksQuery,
  useChatShareQuery,
} from "@/lib/react-query/use-chatshare-query";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
}

export default function ShareDialog({
  open,
  onOpenChange,
  chatId,
}: ShareDialogProps) {
  const { data: links = [], refetch } = useChatShareLinksQuery(chatId);
  const { createChatShareLinkMutation, deleteChatShareLinkMutation } =
    useChatShareQuery(chatId);

  const onCreateNewLink = async () => {
    try {
      await createChatShareLinkMutation.mutateAsync(chatId, {
        onSuccess: () => {
          refetch(); // Refresh the links list
          toast.success("Share link created");
        },
        onError: () => {
          toast.error("Failed to create share link");
        },
      });
    } catch {
      toast.error("Failed to create share link");
    }
  };

  const onCopyLink = (linkId: string) => {
    const url = `${window.location.origin}/share/${linkId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const onDeleteLink = async (linkId: string) => {
    try {
      await deleteChatShareLinkMutation.mutateAsync(linkId, {
        onSuccess: () => {
          refetch();
          toast.success("Share link deleted");
        },
        onError: () => {
          toast.error("Failed to delete share link");
        }
      });
    } catch (error) {
      console.error("Error deleting share link:", error);
      toast.error("Failed to delete share link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Chat</DialogTitle>
          <DialogDescription>
            Create and manage shareable links for this chat.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={onCreateNewLink}
            className="flex items-center gap-2 w-full"
            variant="outline"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Link</span>
          </Button>

          {links.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm text-muted-foreground font-medium">
                Previously Created Links
              </h3>
              <div className="max-h-72 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="p-3 rounded-md border bg-card flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">
                          Link {link.id.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <a
                          href={`/share/${link.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate flex items-center hover:underline"
                        >
                          {`/share/${link.id}`}
                          <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => onCopyLink(link.id)}
                        >
                          <Copy className="h-3.5 w-3.5 mr-2" />
                          Copy Link
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => onDeleteLink(link.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Link2 className="h-8 w-8 mx-auto text-muted-foreground/70 mb-2" />
              <p className="text-sm text-muted-foreground">
                No share links created yet.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

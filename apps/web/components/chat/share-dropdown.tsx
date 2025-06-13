"use client";

import type React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@repo/ui/components/dropdown-menu";
import { Button } from "@repo/ui/components/button";
import { Link2, Trash2, Copy, PlusCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  useChatShareLinksQuery,
  useChatShareQuery,
} from "@/lib/react-query/use-chatshare-query";
import { useParams } from "next/navigation";
import { useState } from "react";

interface ShareDropdownProps {
  children: React.ReactNode;
}

export function ShareDropdown({ children }: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  let { cid } = useParams();
  if (!cid) cid = "";

  const { data: links = [], refetch } = useChatShareLinksQuery(cid as string);
  const { createChatShareLinkMutation, deleteChatShareLinkMutation } =
    useChatShareQuery(cid as string);

  const onCreateNewLink = async (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent dropdown close
    try {
      await createChatShareLinkMutation.mutateAsync(cid as string, {
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
        },
      });
    } catch (error) {
      console.error("Error deleting share link:", error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 md:w-96 p-0 custom-scrollbar"
        align="end"
      >
        <DropdownMenuLabel className="font-medium text-base px-4 py-3">
          Share Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onCreateNewLink(e);
          }}
          className="flex items-center gap-2 px-4 py-3 text-sm cursor-pointer hover:bg-accent"
        >
          <PlusCircle className="h-4 w-4 text-primary" />
          <span>Create New Link</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {links.length > 0 ? (
          <>
            <DropdownMenuLabel className="px-4 py-2 text-xs text-muted-foreground font-normal">
              Previously Created Links
            </DropdownMenuLabel>
            <DropdownMenuGroup className="max-h-72 overflow-y-auto custom-scrollbar">
              {links.map((link) => (
                <div key={link.id} className="px-2 py-1">
                  <div className="p-2 rounded-md hover:bg-accent">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-foreground truncate pr-2">
                        Link {link.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={`/share/${link.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline truncate flex items-center"
                        onClick={(e) => e.stopPropagation()} // Prevent dropdown close
                      >
                        {`/share/${link.id}`}
                        <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                      </a>
                      <div className="flex items-center justify-between w-full">
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopyLink(link.id);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy link</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive/90"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent dropdown close
                            onDeleteLink(link.id);
                          }}
                          onSelect={(e) => e.preventDefault()} // Prevent dropdown close on select
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete link</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </DropdownMenuGroup>
          </>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            <Link2 className="h-8 w-8 mx-auto text-muted-foreground/70 mb-2" />
            No share links created yet.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

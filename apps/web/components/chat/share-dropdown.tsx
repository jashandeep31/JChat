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

interface ShareLink {
  id: string;
  url: string;
}

interface ShareDropdownProps {
  children: React.ReactNode;
  links: ShareLink[];
  onCreateNewLink: () => void;
  onDeleteLink: (linkId: string) => void;
}

export function ShareDropdown({
  children,
  links,
  onCreateNewLink,
  onDeleteLink,
}: ShareDropdownProps) {
  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link Copied", {
        description: "The shareable link has been copied to your clipboard.",
      });
    } catch {
      toast.error("Copy Failed", {
        description: "Could not copy the link. Please try again.",
      });
    }
  };

  return (
    <DropdownMenu>
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
          onClick={onCreateNewLink}
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
              {links.map((link, index) => (
                <div key={link.id} className="px-2 py-1">
                  <div className="p-2 rounded-md hover:bg-accent">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-foreground truncate pr-2">
                        Link {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline truncate flex items-center"
                        onClick={(e) => e.stopPropagation()} // Prevent dropdown close
                      >
                        {link.url.replace(/^https?:\/\//, "").split("/")[0] +
                          "/.../" +
                          link.url.split("/").pop()}
                        <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                      </a>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent dropdown close
                            handleCopyLink(link.url);
                          }}
                          onSelect={(e) => e.preventDefault()} // Prevent dropdown close on select
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span className="sr-only">Copy link</span>
                        </Button>
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

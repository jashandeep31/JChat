"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/command";
import { Clock } from "lucide-react";
import { useContext } from "react";
import { SearchDialogContext } from "@/context/search-dialog-context";
import { Chat } from "@repo/db";
import { useChatsStore } from "@/z-store/chats-store";

export function SearchDialog() {
  const { open, setOpen } = useContext(SearchDialogContext);
  const { chats } = useChatsStore();
  const router = useRouter();

  useEffect(() => {
    // This is a workaround to style the cmdk-input
    const input = document.querySelector('input[cmdk-input=""]');
    if (input) {
      input.classList.add(
        "text-base",
        "placeholder:text-slate-400",
        "border-0",
        "focus:ring-0",
        "h-14",
        "px-0"
      );
    }
  }, [open]);

  const handleSelect = (chat: Chat) => {
    setOpen(false);
    router.push(`/chat/${chat.id}`);
  };

  const handleNewChat = (query: string) => {
    setOpen(false);
    router.push(`/chat/new?q=${encodeURIComponent(query)}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center border-b border-brand-separator-pink ">
        <CommandInput
          placeholder="Search or press Enter to start new chat..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value) {
              const selectedValue = document
                .querySelector('[aria-selected="true"]')
                ?.getAttribute("data-value");
              if (!selectedValue) {
                handleNewChat(e.currentTarget.value);
              }
            }
          }}
        />
      </div>
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup
          heading="Recent Chats"
          className="p-2 text-brand-search-text"
        >
          <div className="flex items-center px-2 py-1.5 text-sm font-medium text-slate-500">
            <Clock className="mr-2 h-4 w-4" />
            Recent Chats
          </div>
          {chats?.map((chat: Chat) => (
            <CommandItem
              key={chat.id}
              value={chat.name + chat.id}
              onSelect={() => handleSelect(chat)}
              className="p-3 my-1 text-ase rounded-md cursor-pointer aria-selected:bg-brand-button-bg-light-pink"
            >
              {chat.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

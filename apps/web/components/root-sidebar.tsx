"use client";
import React, { useContext } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { Button } from "@repo/ui/components/button";
import SidebarProjects from "./sidebar-projects";
import SidebarChats from "./sidebar-chats";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import { SearchDialogContext } from "@/context/search-dialog-context";
import { ThemeToggler } from "./theme-toggler";
import { useCurrentChat } from "@/context/current-chat-context";

const RootSideBar = () => {
  const { data: session } = useSession();
  const { setOpen } = useContext(SearchDialogContext);
  const { startNewChat } = useCurrentChat();
  return (
    <div>
      <Sidebar>
        <SidebarHeader className="flex items-center gap-2 flex-row relative px-4 pt-3">
          <SidebarTrigger className="" />
          <h2 className="flex-1 font-semibold text-center">JChat</h2>
          <ThemeToggler className="border-0 p-1 shadow-none " size="sm" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="p-3 space-y-2">
            <Button onClick={startNewChat}>New Chat</Button>
            <Button
              variant={"outline"}
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 justify-between"
            >
              <span className="flex items-center gap-2">
                <Search /> Search
              </span>
              <span className="text-xs text-muted-foreground cursor-pointer">
                Ctrl + K
              </span>
            </Button>
          </SidebarGroup>
          <SidebarProjects />
          <SidebarChats />
        </SidebarContent>
        <SidebarFooter>
          {session?.user ? (
            <Link
              href={"/profile"}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl dark:text-black text-white  bg-primary p-2 w-10 h-10 rounded-full flex items-center justify-center">
                  {session.user.name?.[0]}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.user.proUser ? "Pro User" : "Free User"}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <Link
              href={"/login"}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-center border justify-center"
            >
              Login
            </Link>
          )}
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default RootSideBar;

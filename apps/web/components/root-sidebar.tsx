import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { Button } from "@repo/ui/components/button";
import SidebarProjects from "./sidebar-projects";
import SidebarChats from "./sidebar-chats";

const RootSideBar = () => {
  return (
    <div>
      <Sidebar>
        <SidebarHeader className="flex items-center gap-2 flex-row relative px-4 pt-3">
          <SidebarTrigger className="absolute left-2" />
          <h2 className="flex-1 font-semibold text-center">JChat</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="p-3">
            <Button>New Chat</Button>
          </SidebarGroup>
          <SidebarProjects />
          <SidebarChats />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </div>
  );
};

export default RootSideBar;

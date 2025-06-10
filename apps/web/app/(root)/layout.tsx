"use client";
import React from "react";
import { SidebarProvider, useSidebar } from "@repo/ui/components/sidebar";
import RootSideBar from "@/components/root-sidebar";
import { PanelLeft, Plus, Search } from "lucide-react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SidebarProvider>
        <RootSideBar />
        <SideBarControls />

        <main className="w-full flex flex-col">{children}</main>
      </SidebarProvider>
    </div>
  );
};

export default layout;

const SideBarControls = () => {
  const { open, setOpen } = useSidebar();

  return (
    <div
      className={`fixed top-4 left-4 z-20 transition-all  ease-in-out ${
        open
          ? "opacity-0 pointer-events-none duration-75"
          : "opacity-100 duration-600"
      }`}
    >
      <div className="flex gap-2 items-center bg-sidebar border p-1.5 rounded-lg">
        <button
          className="p-2 rounded hover:bg-sidebar-accent transition-colors duration-200"
          onClick={() => setOpen(!open)}
          aria-label="Open sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded hover:bg-accent transition-colors duration-200"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded hover:bg-accent transition-colors duration-200"
          aria-label="Add new"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

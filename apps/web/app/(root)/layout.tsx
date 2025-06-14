"use client";
import React, { useContext, useEffect } from "react";
import { SidebarProvider, useSidebar } from "@repo/ui/components/sidebar";
import RootSideBar from "@/components/root-sidebar";
import { PanelLeft, Plus, Search } from "lucide-react";
import { SearchDialogContext } from "@/context/search-dialog-context";
import { SearchDialog } from "@/components/search-dialog";
import { useRouter } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { setOpen } = useContext(SearchDialogContext);
  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "k" && e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    });

    return () => {
      window.removeEventListener("keydown", (e) => {
        if (e.key === "k" && e.ctrlKey) {
          e.preventDefault();
          setOpen(false);
        }
      });
    };
  }, [setOpen]);

  return (
    <div>
      <SidebarProvider>
        <RootSideBar />
        <SearchDialog />
        <SideBarControls />
        <main className="w-full flex flex-col">{children}</main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;

const SideBarControls = () => {
  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();

  const { setOpen: setSearchOpen } = useContext(SearchDialogContext);
  return (
    <div
      className={`fixed top-4 left-4 z-20 transition-all  ease-in-out ${
        open
          ? "md:opacity-0 md:pointer-events-none duration-75"
          : "md:opacity-100 md:duration-600"
      }`}
    >
      <div className="flex gap-2 items-center bg-sidebar border p-1.5 rounded-lg">
        <button
          className="p-2 rounded hover:bg-sidebar-accent transition-colors duration-200"
          onClick={() => toggleSidebar()}
          aria-label="Open sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded hover:bg-accent transition-colors duration-200"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded hover:bg-accent transition-colors duration-200"
          aria-label="Add new"
          onClick={() => router.push("/")}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

"use client";
import React from "react";
import { SidebarProvider } from "@repo/ui/components/sidebar";
import RootSideBar from "@/components/root-sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SidebarProvider>
        <RootSideBar />
        <main className="p-4">{children}</main>
      </SidebarProvider>
    </div>
  );
};

export default layout;

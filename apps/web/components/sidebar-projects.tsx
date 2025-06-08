import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { Folder } from "lucide-react";
import React from "react";

const SidebarProjects = () => {
  const Projects = [
    {
      name: "Project 1",
      id: 1,
    },
    {
      name: "Project 2",
      id: 2,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {Projects.map((project) => (
          <SidebarMenuButton key={project.id}>
            <Folder /> <span>{project.name}</span>
          </SidebarMenuButton>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default SidebarProjects;

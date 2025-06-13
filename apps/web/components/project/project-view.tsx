"use client";
import { Project } from "@repo/db";
import ProjectViewContainer from "./project-view-container";

const ProjectView = ({ project }: { project: Project }) => {
  return <ProjectViewContainer project={project} />;
};



export default ProjectView;

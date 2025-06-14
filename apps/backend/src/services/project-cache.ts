import { Project } from "@repo/db";
import { db, redis } from "../lib/db.js";

export const getProject = async (
  projectId: string
): Promise<Project | null> => {
  const hit = await redis.get(`project:${projectId}`);
  if (hit) {
    return JSON.parse(hit) as Project;
  }
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return null;
  await redis.set(
    `project:${projectId}`,
    JSON.stringify(project),
    "EX",
    20 * 60
  );
  return project;
};

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const getProjects = async () => {
  const session = await auth();
  if (!session?.user) return [];
  const projects = await db.project.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return projects;
};

export const createProject = async ({ name }: { name: string }) => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!name) throw new Error("Project name is required");

  const project = await db.project.create({
    data: {
      name,
      userId: session.user.id,
    },
  });
  return project;
};

export const addInstructionToProject = async ({
  id,
  instruction,
}: {
  id: string;
  instruction: string;
}) => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const project = await db.project.update({
    where: {
      id,
    },
    data: {
      instruction,
    },
  });
  revalidatePath(`/project/${id}`);
  return project;
};

export const updateProjectName = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!name) throw new Error("Project name is required");

  const project = await db.project.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
  revalidatePath(`/project/${id}`);
  return project;
};

export const deleteProject = async (id: string) => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Delete all chats associated with this project
  await db.chat.updateMany({
    where: {
      projectId: id,
    },
    data: {
      projectId: null,
    },
  });

  // Delete the project
  const project = await db.project.delete({
    where: {
      id,
    },
  });

  revalidatePath("/");
  return project;
};

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const getProjects = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");
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

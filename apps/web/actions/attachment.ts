"use server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const getAttachments = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const attachments = await db.attachment.findMany({
    where: {
      userId: session?.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return attachments;
};

export const deleteAttachment = async (id: string) => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await db.attachment.delete({
    where: {
      id,
    },
  });
  return;
};

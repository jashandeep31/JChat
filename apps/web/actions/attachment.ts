"use server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Attachment } from "@repo/db";
import { redirect } from "next/navigation";
export const getAttachment = async (id: string): Promise<Attachment | null> => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const attachment = await db.attachment.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });
  return attachment;
};
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

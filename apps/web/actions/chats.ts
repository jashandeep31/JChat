"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const getChats = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const chats = await db.chat.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return chats;
};

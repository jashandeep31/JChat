import { auth } from "@/lib/auth";
import { db, redis } from "@/lib/db";
import React from "react";
import { redirect } from "next/navigation";
import ChatView from "@/components/chat/chat-view";
import { Chat } from "@repo/db";

const page = async ({ params }: { params: Promise<{ cid: string }> }) => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  let chat = null;
  const chatInCache = await redis.get(`chat:${(await params).cid}`);
  if (chatInCache) {
    const parsedData: Chat = JSON.parse(chatInCache);
    if (parsedData.userId === session.user.id) {
      chat = parsedData;
    }
  }
  if (!chat) {
    chat = await db.chat.findUnique({
      where: {
        id: (await params).cid,
        userId: session.user.id,
      },
    });
  }

  if (!chat) {
    redirect("/");
  }

  return <ChatView />;
};
export default page;

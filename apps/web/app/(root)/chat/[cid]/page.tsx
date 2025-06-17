import React from "react";
import ChatView from "@/components/chat/chat-view";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChat } from "@/actions/chats";

const page = async ({ params }: { params: Promise<{ cid: string }> }) => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const chat = await getChat((await params).cid);
  if (!chat) {
    redirect("/");
  }

  return <ChatView chatId={(await params).cid} />;
};
export default page;

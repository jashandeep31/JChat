import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import React from "react";
import { redirect } from "next/navigation";
import ChatView from "@/components/chat/chat-view";

const page = async ({ params }: { params: Promise<{ cid: string }> }) => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const chat = await db.chat.findUnique({
    where: {
      id: (await params).cid,
      userId: session.user.id,
    },
  });

  if (!chat) {
    redirect("/");
  }

  return <ChatView />;
};

export default page;

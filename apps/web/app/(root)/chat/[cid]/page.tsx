import React from "react";
import ChatView from "@/components/chat/chat-view";

const page = async ({ params }: { params: Promise<{ cid: string }> }) => {
  return <ChatView chatId={(await params).cid} />;
};
export default page;

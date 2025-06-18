import React from "react";
import ChatView from "@/components/chat/chat-view";
import { ChatContextProvider } from "@/context/chat-context";

const page = async ({ params }: { params: Promise<{ cid: string }> }) => {
  return (
    <ChatContextProvider chatId={(await params).cid}>
      <ChatView chatId={(await params).cid} />
    </ChatContextProvider>
  );
};
export default page;

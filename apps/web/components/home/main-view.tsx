"use client";
import React, { useEffect } from "react";
import DummyQuestions from "../chat/dummy-questions";
import ChatInputBox from "../chat-input-box";
import { LoginPromptCard } from "./login-prompt-card";
import { useSession } from "next-auth/react";
import { useCurrentChat } from "@/context/current-chat-context";
import ChatView from "../chat/chat-view";
import { useRouter } from "next/navigation";
import { ChatContextProvider } from "@/context/chat-context";

const MainView = () => {
  const router = useRouter();
  const session = useSession();
  const { chatId, setChatId } = useCurrentChat();

  useEffect(() => {
    if (!chatId) return;
    router.replace(`/chat/${chatId}`);
  }, [setChatId, router, chatId]);

  if (session.status === "loading") {
    return null;
  } else if (chatId && session.status === "authenticated") {
    return (
      <ChatContextProvider chatId={chatId}>
        <ChatView chatId={chatId} />
      </ChatContextProvider>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen md:p-0 p-4">
        <div className="flex-1 justify-center flex ">
          <div className="lg:max-w-800px lg:pt-24 md:pt-16 py-6">
            <DummyQuestions />
          </div>
        </div>
        <div className="flex justify-center  ">
          <div className="lg:max-w-[800px] flex-1 w-full">
            {session.data?.user ? <ChatInputBox /> : <LoginPromptCard />}
          </div>
        </div>
      </div>
    );
  }
};

export default MainView;

"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "@/context/socket-context";
import { ChatInputBoxProvider } from "@/context/chat-input-box-context";

const queryClient = new QueryClient();

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatInputBoxProvider>
        <SocketProvider>{children}</SocketProvider>
      </ChatInputBoxProvider>
    </QueryClientProvider>
  );
};

export default Provider;

"use client";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "@/context/socket-context";
import { ChatInputBoxProvider } from "@/context/chat-input-box-context";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

const queryClient = new QueryClient();

const Provider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "O" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        router.push("/");
      }
    });

    return () => {
      window.removeEventListener("keypress", (e) => {
        if (e.key === "o" && e.ctrlKey && e.shiftKey) {
          console.log("Open sidebar");
        }
      });
    };
  }, [router]);
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ChatInputBoxProvider>
          <SocketProvider>{children}</SocketProvider>
        </ChatInputBoxProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Provider;

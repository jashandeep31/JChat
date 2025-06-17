"use client";
import useChatQuery from "@/lib/react-query/use-chat-query";
import { Chat } from "@repo/db";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/constants";
import { useCurrentChat } from "./current-chat-context";

export const SocketContext = createContext<Socket | null>(null);
const SOCKET_URL = BACKEND_URL;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { setChatId } = useCurrentChat();
  const { appendChat, updateChatName } = useChatQuery();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, { withCredentials: true });
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("branch_chat_started", () => {
        router.push(`/branching/`);
      });
      socket.on("branch_chat_created", (chat: Chat) => {
        router.push(`/chat/${chat.id}`);
        setChatId(chat.id);
        appendChat(chat);
      });
      socket.on("chat_created", (chat: Chat) => {
        setChatId(chat.id);
        appendChat(chat);
      });
      socket.on("project_chat_created", (chat: Chat) => {
        setChatId(chat.id);
        router.push(`/chat/${chat.id}`);
        appendChat(chat);
      });
      socket.on("chat_name_updated", (chat: Chat) => {
        updateChatName(chat);
      });
      socket.on("error", (error: string) => {
        toast.error(error);
      });
    }
  }, [socket, router, appendChat, updateChatName, setChatId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

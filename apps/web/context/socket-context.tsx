"use client";
import useChatQuery from "@/lib/react-query/use-chat-query";
import { Chat } from "@repo/db";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<Socket | null>(null);
const SOCKET_URL = "http://localhost:8000";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { appendChat, updateChatName } = useChatQuery();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("chat_created", (chat: Chat) => {
        router.push(`/chat/${chat.id}`);
        appendChat(chat);
      });
      socket.on("chat_name_updated", (chat: Chat) => {
        updateChatName(chat);
      });
    }
  }, [socket, router, appendChat, updateChatName]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

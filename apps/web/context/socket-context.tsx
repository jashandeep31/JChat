"use client";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<Socket | null>(null);
const SOCKET_URL = "http://localhost:8000";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);
    socketInstance.on("chat_created", (chatId) => {
      router.push(`/chat/${chatId}`);
    });
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

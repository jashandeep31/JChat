"use client";
import { Chat, ChatQuestion } from "@repo/db";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/constants";
import { useCurrentChat } from "./current-chat-context";
import { useChatQAStore } from "@/z-store/chat-qa-store";
import { useChatsStore } from "@/z-store/chats-store";

export const SocketContext = createContext<Socket | null>(null);
const SOCKET_URL = BACKEND_URL;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { setChatId } = useCurrentChat();
  const { updateChatName, addChat } = useChatsStore();
  const { addMultipleQuestions, getQuestionsOfChat } = useChatQAStore();
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
      socket.on(
        "chat_branched",
        ({
          // from,
          to,
          data,
          // tillQuestionId,
        }: {
          from: string;
          to: string;
          data: Chat;
          tillQuestionId: string;
        }) => {
          router.push(`/chat/${to}`);
          addChat(data);
          // const questions = getQuestionsOfChat(from);
          // const tillQuestionIndex = questions.findIndex(
          //   (question) => question.id === tillQuestionId
          // );
          // addMultipleQuestions(to, questions.slice(0, tillQuestionIndex + 1));
        }
      );
      socket.on(
        "chat_created",
        ({ chat, question }: { chat: Chat; question: ChatQuestion }) => {
          setChatId(chat.id);
          addChat(chat);
          addMultipleQuestions(chat.id, [
            { ...question, ChatQuestionAnswer: [] },
          ]);
        }
      );
      socket.on(
        "project_chat_created",
        ({ chat, question }: { chat: Chat; question: ChatQuestion }) => {
          setChatId(chat.id);
          addChat(chat);
          addMultipleQuestions(chat.id, [
            { ...question, ChatQuestionAnswer: [] },
          ]);
          router.push(`/chat/${chat.id}`);
        }
      );
      socket.on("chat_name_updated", (chat: Chat) => {
        updateChatName(chat.id, chat.name);
      });
      socket.on("error", (error: string) => {
        toast.error(error);
      });
    }
  }, [
    socket,
    router,
    addChat,
    updateChatName,
    setChatId,
    getQuestionsOfChat,
    addMultipleQuestions,
  ]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

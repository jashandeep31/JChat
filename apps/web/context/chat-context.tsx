"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { SocketContext } from "@/context/socket-context";
import { ChatQuestion, ChatQuestionAnswer, WebSearch } from "@repo/db";
import { useChatQAStore } from "@/z-store/chat-qa-store";

export interface ChatState {
  isStreaming: boolean;
  streamingResponse: {
    questionId: string;
    data: {
      text: string;
      images: string;
      reasoning: string;
      webSearches: { title: string; url: string }[];
    };
  } | null;
  setStreamingResponse: (
    value: {
      questionId: string;
      data: {
        text: string;
        images: string;
        reasoning: string;
        webSearches: { title: string; url: string }[];
      };
    } | null
  ) => void;
  setIsStreaming: (value: boolean) => void;
  askQuestion: (text: string) => void;
}

const ChatContext = createContext<ChatState | undefined>(undefined);

export interface ChatContextProviderProps {
  chatId: string;
  children: ReactNode;
}

export const ChatContextProvider: React.FC<ChatContextProviderProps> = ({
  chatId,
  children,
}) => {
  const socket = useContext(SocketContext);
  const { addQuestion, appendAnswerToQuestion } = useChatQAStore();

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] =
    useState<ChatState["streamingResponse"]>(null);

  const askQuestion = useCallback(
    (text: string) => {
      if (!socket) return;
      socket.emit("new_question", { cid: chatId, text });
    },
    [socket, chatId]
  );

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_chat", chatId);

    const handleQuestionCreated = (questionData: {
      cid: string;
      question: ChatQuestion;
    }) => {
      const { question } = questionData;
      addQuestion(chatId, { ...question, ChatQuestionAnswer: [] });
      setStreamingResponse({
        questionId: question.id,
        data: { text: "", images: "", reasoning: "", webSearches: [] },
      });
    };

    const handleResponseChunk = (chunkData: string) => {
      const parsed: {
        data: {
          text: string;
          images: string;
          reasoning: string;
          webSearches: { title: string; url: string }[];
        };
        cid: string;
        questionId: string;
      } = JSON.parse(chunkData);

      setStreamingResponse({
        questionId: parsed.questionId,
        data: {
          text: parsed.data.text,
          images: parsed.data.images,
          reasoning: parsed.data.reasoning,
          webSearches: parsed.data.webSearches,
        },
      });
      setIsStreaming(true);
    };

    const handleQuestionAnswered = (raw: {
      cid: string;
      answer: ChatQuestionAnswer & { WebSearch: WebSearch[] };
    }) => {
      appendAnswerToQuestion(raw.cid, raw.answer.chatQuestionId, raw.answer);
      setStreamingResponse(null);
      setIsStreaming(false);
    };

    socket.on("question_created", handleQuestionCreated);
    socket.on("question_response_chunk", handleResponseChunk);
    socket.on("question_answered", handleQuestionAnswered);

    return () => {
      socket.off("question_created", handleQuestionCreated);
      socket.off("question_response_chunk", handleResponseChunk);
      socket.off("question_answered", handleQuestionAnswered);
      socket.emit("leave_chat", chatId);
    };
  }, [socket, chatId, addQuestion, appendAnswerToQuestion]);

  return (
    <ChatContext.Provider
      value={{
        isStreaming,
        streamingResponse,
        setIsStreaming,
        setStreamingResponse,
        askQuestion,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

/**
 * Hook to access chat-socket state & actions.
 * Must be used within a ChatSocketProvider.
 */
export function useChatContext(): ChatState {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error(
      "useChatSocketContext must be used within a ChatSocketProvider"
    );
  }
  return ctx;
}

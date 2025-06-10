"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { SocketContext } from "@/context/socket-context";
import { ChatQuestion, ChatQuestionAnswer } from "@repo/db";

export interface FullChatQuestion extends ChatQuestion {
  ChatQuestionAnswer: ChatQuestionAnswer[];
}

export interface ChatSocketState {
  chatQuestions: FullChatQuestion[];
  isStreaming: boolean;
  streamingResponse: string | null;
}

export interface UseChatSocketReturn extends ChatSocketState {
  askQuestion: (text: string) => void;
}

export const useChatSocket = (
  chatId: string,
  initialData: {
    questions: FullChatQuestion[];
  }
): UseChatSocketReturn => {
  const socket = useContext(SocketContext);

  const [chatQuestions, setChatQuestions] = useState<FullChatQuestion[]>(
    initialData.questions
  );

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState<string | null>(
    null
  );

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
      setChatQuestions((prev) =>
        prev.some((q) => q.id === question.id)
          ? prev
          : [...prev, { ...question, ChatQuestionAnswer: [] }]
      );
      setStreamingResponse(" ");
    };

    const handleResponseChunk = (chunkData: string) => {
      const parsed = JSON.parse(chunkData);
      setStreamingResponse((prev) => (prev ?? "") + parsed.data);
      setIsStreaming(true);
    };

    const handleQuestionAnswered = (raw: {
      cid: string;
      answer: ChatQuestionAnswer;
    }) => {
      console.log(raw);
      setChatQuestions((prev) => {
        return prev.map((q) => {
          if (q.id === raw.answer.chatQuestionId) {
            return {
              ...q,
              ChatQuestionAnswer: [...q.ChatQuestionAnswer, raw.answer],
            };
          }
          return q;
        });
      });
      // console.log(raw);
      setStreamingResponse(null);
      setIsStreaming(false);
    };

    socket.on("question_created", handleQuestionCreated);
    socket.on("question_response_chunk", handleResponseChunk);
    socket.on("question_answered", handleQuestionAnswered);
    socket.on("qa_pairs", (qaData) => {
      console.log(qaData);
      setChatQuestions(qaData.qaPairs);
    });
    return () => {
      socket.off("question_created", handleQuestionCreated);
      socket.off("question_response_chunk", handleResponseChunk);
      socket.off("question_answered", handleQuestionAnswered);
      socket.emit("leave_chat", chatId);
    };
  }, [socket, chatId]);

  return {
    chatQuestions,
    isStreaming,
    streamingResponse,
    askQuestion,
  };
};

"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { SocketContext } from "@/context/socket-context";
import { ChatQuestion, ChatQuestionAnswer } from "@repo/db";

export interface ChatSocketState {
  chatQuestions: ChatQuestion[];
  answers: ChatQuestionAnswer[];
  isStreaming: boolean;
  streamingResponse: string | null;
}

export interface UseChatSocketReturn extends ChatSocketState {
  askQuestion: (text: string) => void;
}

export const useChatSocket = (
  chatId: string,
  initialData: {
    questions: ChatQuestion[];
    answers: ChatQuestionAnswer[];
  }
): UseChatSocketReturn => {
  const socket = useContext(SocketContext);

  const [chatQuestions, setChatQuestions] = useState<ChatQuestion[]>(
    initialData.questions
  );
  const [answers, setAnswers] = useState<ChatQuestionAnswer[]>(
    initialData.answers
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

    const handleQuestionCreated = (raw: {
      cid: string;
      question: ChatQuestion;
    }) => {
      const { question } = raw;
      setChatQuestions((prev) =>
        prev.some((q) => q.id === question.id) ? prev : [...prev, question]
      );
      setStreamingResponse(" ");
    };

    const handleResponseChunk = (data: string) => {
      const parsed = JSON.parse(data);
      setStreamingResponse((prev) => (prev ?? "") + parsed.data);
      setIsStreaming(true);
    };

    const handleQuestionAnswered = (raw: {
      cid: string;
      answer: ChatQuestionAnswer;
    }) => {
      setAnswers((prev) => [...prev, raw.answer]);
      setStreamingResponse(null);
      setIsStreaming(false);
    };

    socket.on("question_created", handleQuestionCreated);
    socket.on("question_response_chunk", handleResponseChunk);
    socket.on("question_answered", handleQuestionAnswered);
    socket.on("qa_pairs", (raw) => {
      console.log(raw.cid === chatId);
      const questions = raw;
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
    answers,
    isStreaming,
    streamingResponse,
    askQuestion,
  };
};

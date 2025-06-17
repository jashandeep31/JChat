"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { SocketContext } from "@/context/socket-context";
import { ChatQuestion, ChatQuestionAnswer, WebSearch } from "@repo/db";
import { useChatQAStore } from "@/z-store/chat-qa-store";

export interface ChatSocketState {
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
  setIsStreaming: (value: boolean) => void;
}

export interface UseChatSocketReturn extends ChatSocketState {
  askQuestion: (text: string) => void;
}

export const useChatSocket = (chatId: string): UseChatSocketReturn => {
  const socket = useContext(SocketContext);
  const { addQuestion, appendAnswerToQuestion } = useChatQAStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState<{
    questionId: string;
    data: {
      text: string;
      images: string;
      reasoning: string;
      webSearches: { title: string; url: string }[];
    };
  } | null>(null);

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
        data: {
          text: "",
          images: "",
          reasoning: "",
          webSearches: [],
        },
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

      setStreamingResponse(() => ({
        questionId: parsed.questionId,
        data: {
          text: parsed.data.text,
          images: parsed.data.images,
          reasoning: parsed.data.reasoning,
          webSearches: parsed.data.webSearches,
        },
      }));
      setIsStreaming(true);
    };

    const handleQuestionAnswered = (raw: {
      cid: string;
      answer: ChatQuestionAnswer & {
        WebSearch: WebSearch[];
      };
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

  return {
    isStreaming,
    streamingResponse,
    askQuestion,
    setIsStreaming,
  };
};

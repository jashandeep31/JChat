"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { SocketContext } from "@/context/socket-context";
import { ChatQuestion, ChatQuestionAnswer, WebSearch } from "@repo/db";

export interface FullChatQuestion extends ChatQuestion {
  ChatQuestionAnswer: (ChatQuestionAnswer & {
    WebSearch: WebSearch[];
  })[];
}

export interface ChatSocketState {
  chatQuestions: FullChatQuestion[];
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
      setChatQuestions((prev) =>
        prev.some((q) => q.id === question.id)
          ? prev
          : [...prev, { ...question, ChatQuestionAnswer: [] }]
      );
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
      setChatQuestions((prev) => {
        return prev.map((q) => {
          if (q.id === raw.answer.chatQuestionId) {
            return {
              ...q,
              ChatQuestionAnswer: [
                ...q.ChatQuestionAnswer,
                { ...raw.answer, WebSearch: [...raw.answer.WebSearch] },
              ],
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
    setIsStreaming,
  };
};

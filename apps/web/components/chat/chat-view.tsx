"use client";

import React, { useContext, useEffect, useState } from "react";
import ChatInputBox from "../chat-input-box";
import { SocketContext } from "@/context/socket-context";
import { useParams } from "next/navigation";
import { Chat, ChatQuestion, ChatQuestionAnswer } from "@repo/db";
import "highlight.js/styles/stackoverflow-dark.css";
import MarkdownRenderer from "../markdown-renderer";
const QuestionBubble: React.FC<{ content: string }> = ({ content }) => (
  <div className="flex justify-end">
    <div className="bg-accent p-3 rounded-md lg:max-w-2/3">{content}</div>
  </div>
);

// AI answer bubble component
const AnswerBubble: React.FC<{ content: string }> = ({ content }) => (
  <div>
    <MarkdownRenderer content={content} />
  </div>
);

// Streaming response component
const StreamingResponse: React.FC<{ content: string | null }> = ({
  content,
}) => {
  if (!content) return null;

  return <MarkdownRenderer content={content} />;
};

const ChatView = ({
  chat,
}: {
  chat: Chat & {
    ChatQuestion: (ChatQuestion & {
      ChatQuestionAnswer: ChatQuestionAnswer[];
    })[];
  };
}) => {
  const socket = useContext(SocketContext);
  const params = useParams();
  const [chatQuestions, setChatQuestions] = useState<ChatQuestion[]>(
    chat.ChatQuestion
  );
  const [answers, setAnswers] = useState<ChatQuestionAnswer[]>(
    chat.ChatQuestion.flatMap((q) => q.ChatQuestionAnswer)
  );
  const [streamingResponse, setStreamingResponse] = useState<string | null>(
    null
  );

  const getAnswerForQuestion = (questionId: string) => {
    return answers.find((a) => a.chatQuestionId === questionId)?.answer;
  };

  useEffect(() => {
    if (!socket) return;

    // Join chat room
    socket.emit("join_chat", params.cid);

    // Set up event listeners
    const handleQuestionCreated = (raw: string) => {
      const newQuestion = JSON.parse(raw);
      setChatQuestions((prev) => [...prev, newQuestion]);
      setStreamingResponse(" ");
    };

    const handleResponseChunk = (data: string) => {
      const parsedData = JSON.parse(data);
      setStreamingResponse((prev) => prev + parsedData.data);
    };

    const handleQuestionAnswered = (raw: string) => {
      const answer = JSON.parse(raw);
      setAnswers((prev) => [...prev, answer]);
      setStreamingResponse(null);
    };

    // Register event listeners
    socket.on("chat_question_created", handleQuestionCreated);
    socket.on("question_response_chunk", handleResponseChunk);
    socket.on("question_answered", handleQuestionAnswered);

    // Cleanup function
    return () => {
      socket.off("chat_question_created", handleQuestionCreated);
      socket.off("question_response_chunk", handleResponseChunk);
      socket.off("question_answered", handleQuestionAnswered);
    };
  }, [socket, params.cid]);

  return (
    <div className="flex-1 flex flex-col p-4 pb-0">
      <div className="flex-1 ">
        <div className="mx-auto lg:max-w-1/2 w-full ">
          {chatQuestions.map((q) => (
            <div key={q.id} className="my-12">
              <QuestionBubble content={q.question} />
              {getAnswerForQuestion(q.id) && (
                <AnswerBubble content={getAnswerForQuestion(q.id)!} />
              )}
              {!getAnswerForQuestion(q.id) && streamingResponse && (
                <StreamingResponse content={streamingResponse} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="sticky bottom-0 z-10 bg-background">
        <div className="mx-auto lg:max-w-1/2 w-full  bg-background">
          <ChatInputBox />
        </div>
      </div>
    </div>
  );
};

export default ChatView;

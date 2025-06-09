"use client";

import React, { useContext, useEffect, useState } from "react";
import ChatInputBox from "../chat-input-box";
import { SocketContext } from "@/context/socket-context";
import { useParams } from "next/navigation";
import { Chat, ChatQuestion, ChatQuestionAnswer } from "@repo/db";
import "highlight.js/styles/stackoverflow-dark.css";
import QuestionBubble from "./question-bubble";
import AnswerBubble from "./answer-bubble";
import { Loader } from "lucide-react";

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
  const [isStreaming, setIsStreaming] = useState(false);
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
      setIsStreaming(false);
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
            </div>
          ))}
          {isStreaming && <StreamingResponse content={streamingResponse!} />}
        </div>
      </div>
      <div className="sticky bottom-0 z-10 bg-background">
        <div className="mx-auto lg:max-w-1/2 w-full  bg-background">
          <ChatInputBox
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
          />
        </div>
      </div>
    </div>
  );
};

const StreamingResponse = ({ content }: { content: string }) => {
  if (!content || content === " ") {
    return (
      <div>
        <Loader className="animate-spin" />
      </div>
    );
  }
  return <AnswerBubble content={content} />;
};

export default ChatView;

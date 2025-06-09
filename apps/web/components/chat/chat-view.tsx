"use client";

import React, { useContext, useEffect, useState } from "react";
import ChatInputBox from "../chat-input-box";
import { SocketContext } from "@/context/socket-context";
import { useParams } from "next/navigation";
import { Chat, ChatQuestion, ChatQuestionAnswer } from "@repo/db";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/stackoverflow-dark.css";
import { markdownComponents } from "../markdown-components";

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

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_chat", params.cid);
    socket.on("chat_question_created", (raw: string) => {
      const newQuestion = JSON.parse(raw);
      setChatQuestions((prev) => [...prev, newQuestion]);
      setStreamingResponse(" ");
    });

    socket.on("question_response_chunk", (data: string) => {
      const parsedData = JSON.parse(data);
      setStreamingResponse((prev) => prev + parsedData.data);
    });

    socket.on("question_answered", (raw: string) => {
      const answer = JSON.parse(raw);
      setAnswers((prev) => [...prev, answer]);
      setStreamingResponse(null);
    });

    return () => {
      socket.off("chat_question_created");
      socket.off("question_response_chunk");
      socket.off("question_answered");
    };
  }, [socket, params.cid]);

  return (
    <div className="relative">
      <div className="mx-auto lg:max-w-1/2">
        {chatQuestions.map((q) => (
          <div key={q.id} className="my-12">
            <div className="flex justify-end">
              <div className="bg-accent p-3 rounded-md lg:max-w-2/3">
                {q.question}
              </div>
            </div>
            <div className="flex justify-start mt-6 ">
              {answers.find((a) => a.chatQuestionId === q.id)?.answer ? (
                <div className="m-3 rounded-md p-3 grid ">
                  <ReactMarkdown
                    components={markdownComponents}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  >
                    {answers.find((a) => a.chatQuestionId === q.id)!.answer}
                  </ReactMarkdown>
                </div>
              ) : null}
            </div>
            <div className="grid">
              {streamingResponse ? (
                <div className="m-3 rounded-md p-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  >
                    {streamingResponse}
                  </ReactMarkdown>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 bg-background ">
        <div className="mx-auto lg:max-w-1/2 bg-background ">
          <ChatInputBox />
        </div>
      </div>
    </div>
  );
};

export default ChatView;

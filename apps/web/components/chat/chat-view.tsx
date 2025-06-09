"use client";

import React, { useContext, useEffect, useState } from "react";
import ChatInputBox from "../chat-input-box";
import { SocketContext } from "@/context/socket-context";
import { useParams } from "next/navigation";
import { ChatQuestion, ChatQuestionAnswer } from "@repo/db";
import ReactMarkdown from "react-markdown";

const ChatView = () => {
  const socket = useContext(SocketContext);
  const params = useParams();
  const [chatQuestions, setChatQuestions] = useState<ChatQuestion[]>(questions);
  const [answers, setAnswers] = useState<ChatQuestionAnswer[]>(answers1);
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
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 max-w-[800px] mx-auto overflow-y-auto">
        {chatQuestions.map((q) => (
          <div key={q.id} className="my-12">
            <div className="flex justify-end">
              <div className="bg-accent p-3 rounded-md lg:max-w-3/4">
                {q.question}
              </div>
            </div>

            <div className="flex justify-start mt-6 lg:max-w-3/4">
              {answers.find((a) => a.chatQuestionId === q.id)?.answer ? (
                <div className="bg-red-100 m-3 rounded-md p-3">
                  <ReactMarkdown>
                    {answers.find((a) => a.chatQuestionId === q.id)!.answer}
                  </ReactMarkdown>
                </div>
              ) : null}
            </div>
            <div>
              {streamingResponse ? (
                <div className="bg-red-100 m-3 rounded-md p-3">
                  <ReactMarkdown>{streamingResponse}</ReactMarkdown>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <ChatInputBox />
      </div>
    </div>
  );
};

export default ChatView;

const questions = [
  {
    id: "q1",
    chatId: "c1",
    question: "What is Next.js and its main features in 10 words?",
    credits: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "q2",
    chatId: "c1",
    question: "Explain how React hooks work in simple terms.",
    credits: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "q3",
    chatId: "c1",
    question: "Explain how React hooks work in simple terms.",
    credits: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const answers1 = [
  {
    id: "a1",
    chatQuestionId: "q1",
    answer:
      "Next.js is a React framework with server-side rendering and static site generation.",
    credits: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
    aiModelId: "aiModel1",
  },
  {
    id: "a2",
    chatQuestionId: "q2",
    answer:
      "React hooks allow you to use state and lifecycle methods in functional components.",
    credits: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    aiModelId: "aiModel2",
  },
  {
    id: "a3",
    chatQuestionId: "q3",
    answer: `\`\`\`javascript
const nextJsFeatures = {
  ssr: 'Server-side Rendering',
  ssg: 'Static Site Generation',
  apiRoutes: 'API Routes',
};
console.log(nextJsFeatures);
\`\`\``,
    credits: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
    aiModelId: "aiModel3",
  },
  {
    id: "a4",
    chatQuestionId: "q2",
    answer: `\`\`\`javascript
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
\`\`\``,
    credits: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
    aiModelId: "aiModel4",
  },
];

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
  const [streamingResponse, setStreamingResponse] = useState<string>("");
  useEffect(() => {
    if (!socket) return;
    socket.emit("join_chat", params.cid);
    socket.on("chat_question_created", (data: string) => {
      const parsedData = JSON.parse(data);
      setChatQuestions((prev) => [...prev, parsedData]);
    });
    socket.on("question_response_chunk", (data: string) => {
      setStreamingResponse((prev) => prev + data);
    });
    socket.on("question_answered", (data: string) => {
      const parsedData = JSON.parse(data);
      setAnswers((prev) => [...prev, parsedData]);
      setStreamingResponse("");
    });
    return () => {};
  }, [socket, params]);

  console.log(chatQuestions);
  console.log(answers);
  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 max-w-[800px] mx-auto">
        {chatQuestions.map((chatQuestion) => (
          <div key={chatQuestion.id} className="my-12">
            <div className="flex justify-end">
              <div className="lg:max-w-3/4 bg-accent p-3 rounded-md">
                {chatQuestion.question}
              </div>
            </div>
            <div className="flex justify-start rounded-md mt-6 lg:max-w-3/4">
              {answers.find(
                (answer) => answer.chatQuestionId === chatQuestion.id
              )?.answer && (
                <div className="bg-red-100 m-3">
                  <ReactMarkdown>
                    {
                      answers.find(
                        (answer) => answer.chatQuestionId === chatQuestion.id
                      )!.answer
                    }
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        <div className="flex justify-center">{streamingResponse}</div>
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

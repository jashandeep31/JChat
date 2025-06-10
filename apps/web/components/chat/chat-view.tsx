"use client";

import React from "react";
import ChatInputBox from "../chat-input-box";
import QuestionBubble from "./question-bubble";
import AnswerBubble from "./answer-bubble";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { Chat, ChatQuestion, ChatQuestionAnswer } from "@repo/db";
import { useChatSocket } from "@/hooks/use-chat-socket";

interface Props {
  chat: Chat & {
    ChatQuestion: (ChatQuestion & {
      ChatQuestionAnswer: ChatQuestionAnswer[];
    })[];
  };
}

const ChatView: React.FC<Props> = ({ chat }) => {
  const { cid } = useParams<{ cid: string }>();

  const { chatQuestions, answers, isStreaming, streamingResponse } =
    useChatSocket(cid, {
      questions: chat.ChatQuestion,
      answers: chat.ChatQuestion.flatMap((q) => q.ChatQuestionAnswer),
    });

  const getAnswerForQuestion = (questionId: string) =>
    answers.find((a) => a.chatQuestionId === questionId)?.answer;

  return (
    <div className="flex-1 flex flex-col p-4 pb-0">
      <div className="flex-1">
        <div className="mx-auto lg:max-w-1/2 w-full">
          {chatQuestions.map((q) => (
            <div key={q.id} className="my-12">
              <QuestionBubble content={q.question} />
              {getAnswerForQuestion(q.id) && (
                <AnswerBubble content={getAnswerForQuestion(q.id)!} />
              )}
            </div>
          ))}
          {isStreaming && (
            <StreamingResponse content={streamingResponse ?? ""} />
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-background">
        <div className="mx-auto lg:max-w-1/2 w-full bg-background">
          <ChatInputBox isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  );
};

const StreamingResponse: React.FC<{ content: string }> = ({ content }) =>
  !content.trim() ? (
    <Loader className="animate-spin" />
  ) : (
    <AnswerBubble content={content} />
  );

export default ChatView;

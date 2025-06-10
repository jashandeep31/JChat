"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import ChatInputBox from "../chat-input-box";
import QuestionBubble from "./question-bubble";
import AnswerBubble from "./answer-bubble";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { useChatSocket } from "@/hooks/use-chat-socket";

const ChatView: React.FC = () => {
  const { cid } = useParams<{ cid: string }>();
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const { chatQuestions, isStreaming, streamingResponse } = useChatSocket(cid, {
    questions: [],
  });

  useLayoutEffect(() => {
    if (autoScroll && anchorRef.current) {
      anchorRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  }, [chatQuestions, streamingResponse, autoScroll]);
  return (
    <div className="flex-1 flex flex-col p-4 pb-0" ref={containerRef}>
      <div className="flex-1">
        <div className="mx-auto lg:max-w-1/2 w-full">
          {chatQuestions.map((chatQuestion) => (
            <div key={chatQuestion.id} className="my-12">
              <QuestionBubble content={chatQuestion.question} />
              {chatQuestion.ChatQuestionAnswer.length > 0 && (
                <AnswerBubble
                  content={chatQuestion.ChatQuestionAnswer[0].answer}
                />
              )}
            </div>
          ))}
          {isStreaming && (
            <StreamingResponse content={streamingResponse ?? ""} />
          )}
          <div ref={anchorRef} />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-background mt-6">
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

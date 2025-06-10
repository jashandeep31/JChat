"use client";

import React from "react";
import ChatInputBox from "../chat-input-box";
import QuestionBubble from "./question-bubble";
import AnswerBubble from "./answer-bubble";
import { Loader, SlidersHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";

const ChatView: React.FC = () => {
  const { cid } = useParams<{ cid: string }>();
  const { chatQuestions, isStreaming, streamingResponse } = useChatSocket(cid, {
    questions: [],
  });

  return (
    <div className="flex-1 flex flex-col p-4 pb-0">
      <div className="fixed  top-4 right-4 p-0 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={"sm"}>
              <SlidersHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mx-4 bg-background">
            <div className="lg:w-[600px]">
              <div className="p-2">
                <Label className="mb-2">Instruction </Label>
                <Textarea
                  className="resize-none h-24"
                  placeholder="Example: Answer the question in 2 sentences"
                />
                <div className="mt-3 flex justify-end gap-2">
                  <Button size={"sm"} variant="outline">
                    Cancel
                  </Button>
                  <Button size={"sm"}>Save</Button>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 ">
        <div className="mx-auto lg:max-w-1/2 w-full">
          {chatQuestions.map((chatQuestion) => (
            <div key={chatQuestion.id} className="my-12">
              <QuestionBubble content={chatQuestion.question} />
              {chatQuestion.ChatQuestionAnswer.length > 0 && (
                <AnswerBubble question={chatQuestion} />
              )}
            </div>
          ))}
          {/* {isStreaming && (
            <StreamingResponse content={streamingResponse ?? ""} />
          )} */}
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

// const StreamingResponse: React.FC<{ content: string }> = ({ content }) =>
//   !content.trim() ? (
//     <Loader className="animate-spin" />
//   ) : (
//     <AnswerBubble question={{ question: content, ChatQuestionAnswer: [] }} />
//   );

export default ChatView;

"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatInputBox from "../chat-input-box";
import QuestionBubble from "./question-bubble";
import AnswerBubble from "./answer-bubble";
import { ChevronDown, Loader2, Share2, SlidersHorizontal } from "lucide-react";
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
import StreamBubble from "./stream-bubble";
import { ShareDropdown } from "./share-dropdown";
import useChatQuery from "@/lib/react-query/use-chat-query";
import { toast } from "sonner";
import { Chat } from "@repo/db";

const ChatView: React.FC<{ chat: Chat }> = ({ chat }) => {
  const { cid } = useParams<{ cid: string }>();
  const [instruction, setInstruction] = useState(chat.instruction || "");
  const { addChatIntructionMutation } = useChatQuery();
  const { chatQuestions, isStreaming, streamingResponse, setIsStreaming } =
    useChatSocket(cid, {
      questions: [],
    });
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const [isFirstTimeScrolled, setIsFirstTimeScrolled] = useState(false);
  const lastDivRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isFirstTimeScrolled && chatQuestions.length > 0) {
      setIsFirstTimeScrolled(true);
      lastDivRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [chatQuestions, isFirstTimeScrolled]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setShowScrollDownButton(true);
        } else {
          setShowScrollDownButton(false);
        }
      },
      { threshold: 0.9 }
    );

    if (lastDivRef.current) {
      observer.observe(lastDivRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleScrollDown = () => {
    if (lastDivRef.current) {
      lastDivRef.current.scrollIntoView({ behavior: "smooth" });
      setShowScrollDownButton(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-0">
      <div className="fixed  top-4 right-4 z-10 flex gap-2 bg-sidebar border rounded-lg p-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded hover:bg-accent transition-colors duration-200"
              aria-label="Search"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mx-4 bg-background">
            <div className="lg:w-[600px]">
              <div className="p-2">
                <Label className="mb-2 text-base">Instruction </Label>
                <Textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="resize-none h-24"
                  placeholder="Example: Answer the question in 2 sentences"
                />
                <div className="mt-3 flex justify-end gap-2">
                  <Button size={"sm"} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    disabled={addChatIntructionMutation.isPending}
                    size={"sm"}
                    onClick={() => {
                      const toastId = toast.loading("Saving instruction...");
                      addChatIntructionMutation.mutate(
                        {
                          chatId: cid,
                          instruction,
                        },
                        {
                          onSuccess: () => {
                            toast.success("Instruction saved", { id: toastId });
                          },
                          onError: () => {
                            toast.error("Failed to save instruction", {
                              id: toastId,
                            });
                          },
                        }
                      );
                    }}
                  >
                    {addChatIntructionMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <ShareDropdown>
          <button
            className="p-2 rounded hover:bg-accent transition-colors duration-200"
            aria-label="Search"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </ShareDropdown>
      </div>
      <div className="flex-1 ">
        <div className="mx-auto lg:max-w-1/2 w-full">
          {chatQuestions.map((chatQuestion) => (
            <div key={chatQuestion.id} className="my-12">
              <QuestionBubble question={chatQuestion} />
              {chatQuestion.ChatQuestionAnswer.length > 0 &&
                streamingResponse?.questionId !== chatQuestion.id && (
                  <AnswerBubble
                    isStreaming={false}
                    setIsStreaming={setIsStreaming}
                    question={chatQuestion}
                  />
                )}
              {streamingResponse?.questionId === chatQuestion.id && (
                <StreamBubble content={streamingResponse.data} />
              )}
            </div>
          ))}
        </div>
        <div ref={lastDivRef} className=""></div>
      </div>

      <div className="sticky bottom-0 z-10  mt-6">
        <div className="flex justify-center mb-6 ">
          {showScrollDownButton && (
            <button
              onClick={handleScrollDown}
              className="flex text-sm font-medium gap-2 items-center border border-accent rounded-full px-2 py-1 hover:bg-accent transition-colors duration-200 bg-background"
            >
              <span>Scroll to bottom</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="mx-auto lg:max-w-1/2 w-full bg-background">
          <ChatInputBox
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatView;

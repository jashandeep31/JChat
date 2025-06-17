"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatInputBox from "../chat-input-box";
import QuestionBubble from "./question-bubble";
import AnswerBubble from "./answer-bubble";
import { ChevronDown, Share2 } from "lucide-react";
import { useChatSocket } from "@/hooks/use-chat-socket";
import StreamBubble from "./stream-bubble";
import { ShareDropdown } from "./share-dropdown";
import InstructionCard from "./instruction-card";
import { useChatQAStore } from "@/z-store/chat-qa-store";
import { useChatQAPairsQuery } from "@/lib/react-query/use-qa-query";

const ChatView: React.FC<{ chatId: string }> = ({ chatId }) => {
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const [isFirstTimeScrolled, setIsFirstTimeScrolled] = useState(false);
  const lastDivRef = useRef<HTMLDivElement>(null);
  // Fetch initial QAs
  const { data: initialQAs = [] } = useChatQAPairsQuery(chatId);
  const addMultipleQuestions = useChatQAStore(
    (state) => state.addMultipleQuestions
  );
  const getQuestionsOfChat = useChatQAStore(
    (state) => state.getQuestionsOfChat
  );
  const chatQuestions = getQuestionsOfChat(chatId);

  const { isStreaming, streamingResponse, setIsStreaming } =
    useChatSocket(chatId);

  useEffect(() => {
    const existing = getQuestionsOfChat(chatId);
    if (initialQAs.length > 0 && existing.length === 0) {
      addMultipleQuestions(chatId, initialQAs);
    }
  }, [chatId, initialQAs, addMultipleQuestions, getQuestionsOfChat]);

  useEffect(() => {
    if (!isFirstTimeScrolled && chatQuestions && chatQuestions.length > 0) {
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
      { threshold: 0.1 }
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
        <InstructionCard chatId={chatId} />
        <ShareDropdown>
          <button
            className="p-2 rounded hover:bg-accent transition-colors duration-200"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </ShareDropdown>
      </div>
      <div className="flex-1 ">
        <div className="mx-auto lg:max-w-1/2 w-full">
          {chatQuestions?.map((chatQuestion) => (
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
                <StreamBubble streamData={streamingResponse.data} />
              )}
            </div>
          ))}
        </div>
        <div ref={lastDivRef} className=""></div>
      </div>

      <div className="sticky bottom-0 z-10  mt-6">
        <div className="flex justify-center ">
          {showScrollDownButton && (
            <button
              onClick={handleScrollDown}
              className="flex text-sm font-medium gap-2 items-center border border-accent rounded-full px-2 py-1 hover:bg-accent transition-colors duration-200 bg-background absolute top-[-40px] "
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

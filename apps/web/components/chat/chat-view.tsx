"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatInputBox from "../chat-input-box";
import QuestionBubble from "./question-bubble";
import AnswerBubble from "./answer-bubble";
import { ChevronDown, Loader2, Share2 } from "lucide-react";
import StreamBubble from "./stream-bubble";
import { ShareDropdown } from "./share-dropdown";
import InstructionCard from "./instruction-card";
import { useChatQAStore } from "@/z-store/chat-qa-store";
import { useChatQAPairsQuery } from "@/lib/react-query/use-qa-query";
import { useChatContext } from "@/context/chat-context";

const ChatView: React.FC<{ chatId: string; isNew?: boolean }> = ({
  chatId,
  isNew = false,
}) => {
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const [isFirstTimeScrolled, setIsFirstTimeScrolled] = useState(false);
  const lastDivRef = useRef<HTMLDivElement>(null);
  // Fetch initial QAs
  const { data: initialQAs = [], isLoading } = useChatQAPairsQuery(chatId);
  const addMultipleQuestions = useChatQAStore(
    (state) => state.addMultipleQuestions
  );
  const getQuestionsOfChat = useChatQAStore(
    (state) => state.getQuestionsOfChat
  );
  const chatQuestions = getQuestionsOfChat(chatId);

  const {
    isStreaming,
    streamingResponse,
    setIsStreaming,
    setStreamingResponse,
  } = useChatContext();

  useEffect(() => {
    const questions = getQuestionsOfChat(chatId);
    if (
      questions.length === 1 &&
      questions[0].ChatQuestionAnswer.length === 0
    ) {
      setIsStreaming(true);
      setStreamingResponse({
        questionId: questions[0].id,
        data: {
          text: "",
          images: "",
          reasoning: "",
          webSearches: [],
        },
      });
    }
  }, [isNew, getQuestionsOfChat, setIsStreaming, chatId, setStreamingResponse]);

  useEffect(() => {
    if (initialQAs.length > 0 && chatQuestions.length === 0) {
      console.log(chatQuestions.length, initialQAs.length);
      addMultipleQuestions(chatId, initialQAs);
    }
  }, [chatId, initialQAs, addMultipleQuestions, chatQuestions]);

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
        <div className="mx-auto max-w-[800px]  w-full">
          {isLoading && chatQuestions.length === 0 && (
            <div className="flex mt-24 justify-center items-center h-full">
              <p>Loading chats</p>
              <Loader2 className="animate-spin" />
            </div>
          )}

          {!isLoading && chatQuestions?.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p>No chats found</p>
            </div>
          )}

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
        <div className="mx-auto lg:max-w-[800px] w-full bg-background">
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

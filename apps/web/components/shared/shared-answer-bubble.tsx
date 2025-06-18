"use client";
import React, { useState } from "react";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Button } from "@repo/ui/components/button";
import { Check, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

interface ChatQuestionAnswer {
  id: string;
  answer: string;
  imageUrl?: string | null;
}

export const SharedAnswerBubble = ({
  answers,
}: {
  answers: ChatQuestionAnswer[];
}) => {
  const [activeAnswer, setActiveAnswer] = useState(answers[0]);
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeAnswer.answer);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ">
      <div className="prose prose-sm dark:prose-invert max-w-full">
        <MarkdownRenderer content={activeAnswer.answer} />
      </div>

      {activeAnswer.imageUrl && (
        <div className="mt-6 max-w-[500px]">
          {/*  eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="rounded-md"
            src={activeAnswer.imageUrl}
            alt="Generated image"
          />
        </div>
      )}

      <div className="flex mt-4 items-center gap-2">
        <CustomTooltip content="Copy">
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => copyToClipboard()}
          >
            {isCopied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </CustomTooltip>

        {answers.length > 1 && (
          <div className="flex items-center gap-2 ml-auto">
            <AnswerNavigation
              answers={answers}
              activeAnswer={activeAnswer}
              setActiveAnswer={setActiveAnswer}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const CustomTooltip = ({
  children,
  content,
  className,
}: {
  children: React.ReactNode;
  content: string;
  className?: string;
}) => {
  return (
    <div className={className}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

const AnswerNavigation = ({
  answers,
  activeAnswer,
  setActiveAnswer,
}: {
  answers: ChatQuestionAnswer[];
  activeAnswer: ChatQuestionAnswer;
  setActiveAnswer: (answer: ChatQuestionAnswer) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <CustomTooltip content="Previous Answer">
        <button
          className="p-1 hover:bg-accent rounded disabled:opacity-50"
          onClick={() =>
            setActiveAnswer(answers[answers.indexOf(activeAnswer) - 1])
          }
          disabled={answers.indexOf(activeAnswer) === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </CustomTooltip>
      <p className="text-xs">
        {answers.indexOf(activeAnswer) + 1} of {answers.length}
      </p>
      <CustomTooltip content="Next Answer">
        <button
          className="p-1 hover:bg-accent rounded disabled:opacity-50"
          onClick={() =>
            setActiveAnswer(answers[answers.indexOf(activeAnswer) + 1])
          }
          disabled={answers.indexOf(activeAnswer) === answers.length - 1}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </CustomTooltip>
    </div>
  );
};

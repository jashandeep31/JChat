import React, { useContext, useState, useEffect } from "react";
import MarkdownRenderer from "../markdown-renderer";
import { FullQuestion } from "@/z-store/chat-qa-store";
import { Button } from "@repo/ui/components/button";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  RotateCcw,
  Split,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { SocketContext } from "@/context/socket-context";
import useModelsQuery from "@/lib/react-query/use-models-query";
import { RetryModelSelector } from "../retry-model-selector";
import { AiModel } from "@repo/db";
import WebResults from "./web-results";

const AnswerBubbleInner = ({
  question,
  isStreaming,
  setIsStreaming,
}: {
  question: FullQuestion;
  isStreaming: boolean;
  setIsStreaming: (value: boolean) => void;
}) => {
  const { modelsQuery } = useModelsQuery();
  const socket = useContext(SocketContext);
  const answers = question.ChatQuestionAnswer;
  const [activeAnswer, setActiveAnswer] = useState(answers[answers.length - 1]);
  const [isCopied, setIsCopied] = useState(false);
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  useEffect(() => {
    if (
      answers.length > 0 &&
      (!activeAnswer || answers.indexOf(activeAnswer) === -1)
    ) {
      setActiveAnswer(answers[answers.length - 1]);
    }
  }, [answers, activeAnswer]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeAnswer.answer);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBranchOff = () => {
    socket?.emit("branch_off", {
      questionId: question.id,
      cid: question.chatId,
    });
  };

  return (
    <div>
      {activeAnswer.isWebSearch && <WebResults answerId={activeAnswer.id} />}

      {activeAnswer.reasoning && (
        <div>
          <button
            onClick={() => setIsReasoningOpen(!isReasoningOpen)}
            className="flex items-center gap-2 font-medium hover:bg-accent p-2 rounded"
          >
            Reasoning {isReasoningOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
          {isReasoningOpen && (
            <div className="mt-2 border p-2 rounded bg-accent px-3">
              <MarkdownRenderer content={activeAnswer.reasoning} />
            </div>
          )}
        </div>
      )}

      <MarkdownRenderer content={activeAnswer.answer} />

      {activeAnswer.base64Image && (
        <div className="mt-6 max-w-[500px] relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="rounded-md"
            src={`data:image/png;base64,${activeAnswer.base64Image}`}
            alt="Generated"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-2 right-2"
            onClick={() => {
              const link = document.createElement("a");
              link.href = `data:image/png;base64,${activeAnswer.base64Image}`;
              link.download = `jchat-image-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download />
          </Button>
        </div>
      )}

      <div className="flex mt-6 items-center gap-2">
        <CustomTooltip content="Copy">
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>
            {isCopied ? <Check /> : <Copy />}
          </Button>
        </CustomTooltip>

        <RetryModelSelector
          questionId={question.id}
          isStreaming={isStreaming}
          setIsStreaming={setIsStreaming}
          chatId={question.chatId}
          socket={socket}
        >
          <button className="hover:bg-accent p-2 rounded disabled:opacity-50">
            <CustomTooltip content="Retry Message">
              <span>
                <RotateCcw className="w-4 h-4" />
              </span>
            </CustomTooltip>
          </button>
        </RetryModelSelector>

        <CustomTooltip content="Branch Off">
          <Button variant="ghost" size="sm" onClick={handleBranchOff}>
            <Split className="rotate-180" />
          </Button>
        </CustomTooltip>

        <div className="hidden lg:flex items-center gap-2">
          <CustomTooltip content="Model used / Credits used">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  modelsQuery.data?.find(
                    (m: AiModel) => m.id === activeAnswer.aiModelId
                  )?.logo || ""
                }
                className="w-4 h-4 rounded-full"
                alt=""
              />
              <p className="text-xs">
                {
                  modelsQuery.data?.find(
                    (m: AiModel) => m.id === activeAnswer.aiModelId
                  )?.name
                }{" "}
                / {activeAnswer.credits}
              </p>
            </div>
          </CustomTooltip>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <AnswerNavigation
            answers={answers}
            activeAnswer={activeAnswer}
            setActiveAnswer={setActiveAnswer}
          />
        </div>
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
}) => (
  <div className={className}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

const AnswerNavigation = ({
  answers,
  activeAnswer,
  setActiveAnswer,
}: {
  answers: FullQuestion["ChatQuestionAnswer"];
  activeAnswer: FullQuestion["ChatQuestionAnswer"][number];
  setActiveAnswer: (ans: FullQuestion["ChatQuestionAnswer"][number]) => void;
}) => (
  <div className="flex items-center gap-2">
    <CustomTooltip content="Previous Answer">
      <button
        className="p-1 hover:bg-accent rounded disabled:opacity-50"
        onClick={() =>
          setActiveAnswer(answers[answers.indexOf(activeAnswer) - 1])
        }
        disabled={answers.indexOf(activeAnswer) === 0}
      >
        <ChevronLeft />
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
        <ChevronRight />
      </button>
    </CustomTooltip>
  </div>
);

export const AnswerBubble = React.memo(AnswerBubbleInner, (prev, next) => {
  const sameQ = prev.question.id === next.question.id;
  const sameStream = prev.isStreaming === next.isStreaming;
  const prevLen = prev.question.ChatQuestionAnswer.length;
  const nextLen = next.question.ChatQuestionAnswer.length;
  const sameCount = prevLen === nextLen;
  const lastPrev = prev.question.ChatQuestionAnswer[prevLen - 1];
  const lastNext = next.question.ChatQuestionAnswer[nextLen - 1];
  const sameLast = lastPrev === lastNext;
  return sameQ && sameStream && sameCount && sameLast;
});

export default AnswerBubble;

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
  Loader2,
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
import Image from "next/image";

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
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!activeAnswer.imageUrl) return;
    setIsDownloading(true);
    try {
      const res = await fetch(activeAnswer.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = activeAnswer.imageUrl.split("/").pop() || "image";
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
    }
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

      {activeAnswer.imageUrl && (
        <div className="mt-6 max-w-[500px] relative">
          <div className="relative w-full max-w-[500px] h-auto">
            <Image
              className="rounded-md"
              src={activeAnswer.imageUrl}
              alt="Generated image"
              width={500}
              height={500}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="absolute bottom-2 right-2 flex items-center gap-1"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
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

const AnswerBubble = React.memo(AnswerBubbleInner);

export default AnswerBubble;

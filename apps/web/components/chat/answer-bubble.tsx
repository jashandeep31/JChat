import React, { useContext, useState, useEffect } from "react";
import MarkdownRenderer from "../markdown-renderer";
import { FullChatQuestion } from "@/hooks/use-chat-socket";
import { Button } from "@repo/ui/components/button";
import {
  Check,
  ChevronLeft,
  ChevronRight,
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

const AnswerBubble = ({
  question,
  isStreaming,
  setIsStreaming,
}: {
  question: FullChatQuestion;
  isStreaming: boolean;
  setIsStreaming: (value: boolean) => void;
}) => {
  const { modelsQuery } = useModelsQuery();
  const socket = useContext(SocketContext);
  const answers = question.ChatQuestionAnswer;
  const [activeAnswer, setActiveAnswer] = useState(answers[answers.length - 1]);

  // Reset activeAnswer when question changes
  useEffect(() => {
    if (
      answers.length > 0 &&
      (!activeAnswer || answers.indexOf(activeAnswer) === -1)
    ) {
      setActiveAnswer(answers[answers.length - 1]);
    }
  }, [question, answers, activeAnswer]);

  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeAnswer.answer);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleBranchOff = () => {
    socket?.emit("branch_off", {
      questionId: question.id,
      cid: question.chatId,
    });
  };

  return (
    <div>
      <MarkdownRenderer content={activeAnswer.answer} />
      {activeAnswer.base64Image && (
        <div className="mt-6 max-w-[500px] relative">
          {/*  eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="rounded-md"
            src={"data:image/png;base64," + activeAnswer.base64Image}
            alt=""
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute z-10 bottom-2 right-2 "
            onClick={() => {
              const link = document.createElement("a");
              link.href = "data:image/png;base64," + activeAnswer.base64Image;
              link.download = `jchat-image-${new Date().getTime()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex mt-6 items-center gap-2">
        <CustomTooltip content="Copy">
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => copyToClipboard()}
          >
            {isCopied ? <Check /> : <Copy />}
          </Button>
        </CustomTooltip>
        <div className="flex items-center ">
          <RetryModelSelector
            questionId={question.id}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
            chatId={question.chatId}
            socket={socket}
          >
            <button className="hover:bg-accent p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed">
              <CustomTooltip content="Retry Message">
                <RotateCcw className="w-4 h-4" />
              </CustomTooltip>
            </button>
          </RetryModelSelector>
        </div>
        <CustomTooltip content="Branch Off">
          <Button
            onClick={() => handleBranchOff()}
            variant={"ghost"}
            size={"sm"}
          >
            <Split className="rotate-180" />
          </Button>
        </CustomTooltip>
        <div className="md:hidden hidden lg:block">
          <CustomTooltip content="Model used / Credits used">
            <p className="text-xs">
              {
                modelsQuery.data?.find(
                  (model: AiModel) => model.id === activeAnswer.aiModelId
                )?.name
              }{" "}
              / {activeAnswer.credits}
            </p>
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
  answers: FullChatQuestion["ChatQuestionAnswer"];
  activeAnswer: FullChatQuestion["ChatQuestionAnswer"][number];
  setActiveAnswer: (
    answer: FullChatQuestion["ChatQuestionAnswer"][number]
  ) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <CustomTooltip content="Previous Answer">
        <button
          className="p-1 hover:bg-accent  rounded disabled:opacity-50"
          onClick={() =>
            setActiveAnswer(answers[answers.indexOf(activeAnswer) - 1])
          }
          disabled={answers.indexOf(activeAnswer) === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </CustomTooltip>
      <p className="text-xs">
        {answers.indexOf(activeAnswer) !== -1
          ? answers.indexOf(activeAnswer) + 1
          : 1}{" "}
        of {answers.length}
      </p>
      <CustomTooltip content="Next Answer">
        <button
          className="p-1 hover:bg-accent  rounded disabled:opacity-50"
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

export default AnswerBubble;

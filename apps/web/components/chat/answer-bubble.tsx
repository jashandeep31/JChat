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

const AnswerBubble = ({
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
  }, [question, answers, activeAnswer]);

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
    <div className="">
      {/* <div
        className={
          activeAnswer?.WebSearch?.length > 0 ? "max-w-[800px]" : "hidden"
        }
      >
        <h3 className="text-sm font-semibold">Sources</h3>
        <div className="overflow-x-auto flex mt-2 gap-4 hide-scrollbar">
          {activeAnswer.WebSearch.map(
            (webSearch) =>
              webSearch.url && (
                <Link
                  href={webSearch.url}
                  target="_blank"
                  key={webSearch.url}
                  className="max-w-36 border rounded-md p-2 bg-accent hover:border-primary transition-colors border-accent"
                >
                  <p className="text-sm font-semibold truncate">
                    {webSearch.title}
                  </p>
                  <p className="text-xs truncate">{webSearch.url}</p>
                </Link>
              )
          )}
        </div>
      </div> */}
      {activeAnswer.reasoning && (
        <div>
          <button
            onClick={() => setIsReasoningOpen(!isReasoningOpen)}
            className="flex items-center gap-2 font-medium hover:bg-accent p-2 rounded"
          >
            Reasoning{" "}
            {isReasoningOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}{" "}
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

      <div className="flex mt-6 items-center gap-2 ">
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
            <div className="flex items-center gap-2">
              {/*  eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  modelsQuery.data?.find(
                    (model: AiModel) => model.id === activeAnswer.aiModelId
                  )?.logo || ""
                }
                className="w-4 h-4 rounded-full "
                alt=""
              />
              <p className="text-xs">
                {
                  modelsQuery.data?.find(
                    (model: AiModel) => model.id === activeAnswer.aiModelId
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
  answers: FullQuestion["ChatQuestionAnswer"];
  activeAnswer: FullQuestion["ChatQuestionAnswer"][number];
  setActiveAnswer: (answer: FullQuestion["ChatQuestionAnswer"][number]) => void;
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

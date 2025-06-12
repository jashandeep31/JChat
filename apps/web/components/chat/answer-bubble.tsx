import React, { useContext, useState } from "react";
import MarkdownRenderer from "../markdown-renderer";
import { FullChatQuestion } from "@/hooks/use-chat-socket";
import { Button } from "@repo/ui/components/button";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  RotateCcw,
  Split,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { SocketContext } from "@/context/socket-context";
import useModelsQuery from "@/lib/react-query/use-models-query";

const AnswerBubble = ({ question }: { question: FullChatQuestion }) => {
  const { modelsQuery } = useModelsQuery();
  const socket = useContext(SocketContext);
  const answers = question.ChatQuestionAnswer;
  const [activeAnswer, setActiveAnswer] = useState(answers[answers.length - 1]);

  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeAnswer.answer);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div>
      <MarkdownRenderer content={activeAnswer.answer} />
      {activeAnswer.base64Image && (
        <div className="mt-6 max-w-[500px]">
          {/*  eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="rounded-md"
            src={"data:image/png;base64," + activeAnswer.base64Image}
            alt=""
          />
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hover:bg-accent rounded disabled:opacity-50">
                <CustomTooltip content="Retry Message">
                  <RotateCcw className="w-4 h-4" />
                </CustomTooltip>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <button
                onClick={() => {
                  socket?.emit("re_answer", {
                    questionId: question.id,
                    cid: question.chatId,
                    modelSlug: "gemini-2.0-flash",
                  });
                }}
              >
                Gemini 2.0
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CustomTooltip content="Branch Off">
          <Button variant={"ghost"} size={"sm"}>
            <Split className="rotate-180" />
          </Button>
        </CustomTooltip>
        <div className="md:hidden hidden lg:block">
          <CustomTooltip content="Model used / Credits used">
            <p className="text-xs">
              {
                modelsQuery.data?.find(
                  (model) => model.id === activeAnswer.aiModelId
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
        {answers.indexOf(activeAnswer) + 1} of {answers.length}
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

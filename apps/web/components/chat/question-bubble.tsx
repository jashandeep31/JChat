import React, { useContext, useEffect, useRef } from "react";
import { Button } from "@repo/ui/components/button";
import { Copy, Check, File, Edit2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useState } from "react";
import { getAttachmentQuery } from "@/lib/react-query/use-attachment-query";
import Image from "next/image";
import { SocketContext } from "@/context/socket-context";
import { toast } from "sonner";
import { useChatContext } from "@/context/chat-context";
import { FullQuestion, useChatQAStore } from "@/z-store/chat-qa-store";

const QuestionBubbleInner = ({ question }: { question: FullQuestion }) => {
  const socket = useContext(SocketContext);
  const { updateQuestion } = useChatQAStore();
  const questionCardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setIsStreaming, setStreamingResponse } = useChatContext();
  const [textAreaValue, setTextAreaValue] = useState(question.question);
  const [textareaHeight, setTextareaHeight] = useState("auto");
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { data: attachment } = getAttachmentQuery(
    question.attachmentId || null
  );
  const copyToClipboard = () => {
    navigator.clipboard.writeText(question.question);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleEnableEditing = () => {
    const questionCard = questionCardRef.current;
    if (questionCard) {
      const currentHeight = questionCard.clientHeight;
      setTextareaHeight(`${currentHeight}px`);
      setIsEditing(true);
    }
  };

  const submitHandler = () => {
    if (!socket) {
      toast.error("Lost connection", {
        description: "Please refresh the page",
      });
      return;
    }
    socket.emit("edited_question", {
      cid: question.chatId,
      questionId: question.id,
      text: textAreaValue,
      modelId: question.ChatQuestionAnswer[0].aiModelId,
    });
    updateQuestion(question.chatId, question.id, {
      ...question,
      question: textAreaValue,
    });
    setIsStreaming(true);
    setStreamingResponse({
      questionId: question.id,
      data: {
        text: "",
        images: "",
        reasoning: "",
        webSearches: [],
      },
    });
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing) {
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isEditing) {
          setIsEditing(false);
        }
      });
    } else {
      window.removeEventListener("keydown", (e) => {
        if (e.key === "Escape" && isEditing) {
          setIsEditing(false);
        }
      });
    }
    return () => {
      window.removeEventListener("keydown", (e) => {
        if (e.key === "Escape" && isEditing) {
          setIsEditing(false);
        }
      });
    };
  }, [isEditing]);

  return (
    <div className="flex mb-4 flex-col items-end ">
      {question.attachmentId && attachment && (
        <div className="mb-3">
          {attachment.type === "IMAGE" ? (
            <Image
              className="w-24 h-24 object-contain rounded-md  border"
              src={attachment.publicUrl}
              alt=""
              width={100}
              height={100}
            />
          ) : (
            <div className="border p-2 rounded-md inline-flex gap-2 items-center shadow">
              <File className="w-4 h-4" />
              <p>{attachment.filename}</p>
            </div>
          )}
        </div>
      )}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="bg-accent p-3 rounded-md lg:max-w-2/3 outline-none  w-full resize-none  hide-scrollbar"
          style={{ height: `${textareaHeight}` }}
          value={textAreaValue}
          onChange={(e) => setTextAreaValue(e.target.value)}
        />
      ) : (
        <div
          ref={questionCardRef}
          className="bg-accent p-3 rounded-md lg:max-w-2/3 "
        >
          {question.question} {question.id}
        </div>
      )}

      <div className="flex items-center">
        <CustomTooltip content="Copy">
          <Button
            className=""
            variant={"ghost"}
            size={"sm"}
            onClick={() => copyToClipboard()}
          >
            {isCopied ? <Check /> : <Copy />}
          </Button>
        </CustomTooltip>
        {isEditing ? (
          <>
            <CustomTooltip content="Cancel">
              <Button
                className=""
                variant={"ghost"}
                size={"sm"}
                onClick={() => {
                  setIsEditing(false);
                  setTextAreaValue(question.question);
                }}
              >
                Cancel
              </Button>
            </CustomTooltip>
            <CustomTooltip content="Save">
              <Button
                className=""
                variant={"ghost"}
                size={"sm"}
                onClick={submitHandler}
              >
                Save
              </Button>
            </CustomTooltip>
          </>
        ) : (
          <CustomTooltip content="Edit">
            <Button
              className=""
              variant={"ghost"}
              size={"sm"}
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                } else {
                  handleEnableEditing();
                }
              }}
            >
              <Edit2 />
            </Button>
          </CustomTooltip>
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

const QuestionBubble = QuestionBubbleInner;
export default QuestionBubble;

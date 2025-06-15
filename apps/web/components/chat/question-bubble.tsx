import React from "react";
import { Button } from "@repo/ui/components/button";
import { Copy, Check, File } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useState } from "react";
import { ChatQuestion } from "@repo/db";
import { getAttachmentQuery } from "@/lib/react-query/use-attachment-query";
import Image from "next/image";

const QuestionBubble = ({ question }: { question: ChatQuestion }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { data: attachment } = getAttachmentQuery(
    question.attachmentId || null
  );
  console.log(attachment);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(question.question);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="flex mb-4 flex-col items-end group">
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
      <div className="bg-accent p-3 rounded-md lg:max-w-2/3">
        {question.question}
      </div>

      <div className="flex items-center">
        <CustomTooltip content="Copy">
          <Button
            className="opacity-0 group-hover:opacity-100"
            variant={"ghost"}
            size={"sm"}
            onClick={() => copyToClipboard()}
          >
            {isCopied ? <Check /> : <Copy />}
          </Button>
        </CustomTooltip>
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

export default QuestionBubble;

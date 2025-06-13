"use client";
import { SocketContext } from "@/context/socket-context";
import {
  AttachmentInfo,
  useChatInputBox,
} from "@/context/chat-input-box-context";
import { Button } from "@repo/ui/components/button";
import { ArrowUp, Globe, Loader, Paperclip, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useContext } from "react";
import { SelectAIModel } from "./select-ai-model";
import { UploadDialog } from "./upload-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

const ChatInputBox = ({
  isStreaming = false,
  setIsStreaming,
}: {
  isStreaming?: boolean;
  setIsStreaming?: (value: boolean) => void;
}) => {
  const params = useParams();
  const socket = useContext(SocketContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const parentDivRef = useRef<HTMLDivElement>(null);

  const {
    question,
    setQuestion,
    isWebSearchEnabled,
    setIsWebSearchEnabled,
    selectedModel,
    setSelectedModel,
    handleSubmit,
    models,
    isAttachmentDialogOpen,
    setIsAttachmentDialogOpen,
    attachmentInfo,
    setAttachmentInfo,
  } = useChatInputBox();

  useEffect(() => {
    const textarea = textareaRef.current;
    const parentDiv = parentDivRef.current;
    if (textarea && parentDiv) {
      const lineHeight = parseInt(
        window.getComputedStyle(textarea).lineHeight,
        10
      );
      const maxLines = 10;
      const lines = question.split("\n").length;
      const calculatedHeight = Math.min(lines, maxLines) * lineHeight;
      textarea.style.height = `${calculatedHeight}px`;
      parentDiv.style.height = `${Math.max(calculatedHeight + 40, 50)}px`;
    }
  }, [question]);

  const onSubmit = () => {
    handleSubmit({
      setIsStreaming,
      socket,
      params,
    });
  };

  useEffect(() => {
    if (!selectedModel || !selectedModel.imageAnalysis) {
      setAttachmentInfo(null);
    }
  }, [selectedModel, setAttachmentInfo]);

  return (
    <div className="border-2 border-primary p-4 rounded-md w-full flex gap-2 flex-col">
      <div ref={parentDivRef} className="flex-1" style={{ minHeight: "50px" }}>
        <textarea
          ref={textareaRef}
          className="border-0 outline-0 resize-none w-full flex-1"
          style={{
            overflowY: "auto",
            height: "auto",
          }}
          placeholder="Ask anything..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
      </div>
      <div className="flex justify-between items-end">
        <div className="flex gap-2">
          <SelectAIModel
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            models={models}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Tooltip>
            <TooltipTrigger>
              <button
                className={`flex items-center gap-2 text-xs text-muted-foreground border rounded-full py-1 px-2 ${
                  isWebSearchEnabled ? " text-primary border-primary " : ""
                }`}
                onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                type="button"
              >
                <Globe className="w-4 h-4" /> Web Search
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enable web search to get information from the web</p>
            </TooltipContent>
          </Tooltip>

          {selectedModel?.imageAnalysis && (
            <div>
              {attachmentInfo ? (
                <Tooltip>
                  <TooltipTrigger>
                    <AttachmentInfoComponent
                      attachmentInfo={attachmentInfo}
                      setAttachmentInfo={setAttachmentInfo}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{attachmentInfo.filename} is linked</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger>
                    <button
                      className={`flex items-center gap-2 text-xs text-muted-foreground border rounded-full py-1 px-2`}
                      onClick={() => setIsAttachmentDialogOpen(true)}
                      type="button"
                    >
                      <Paperclip className="w-4 h-4" /> Attachment
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Upload files through the chat or other relevant sections.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
          <Button onClick={onSubmit} disabled={isStreaming}>
            {isStreaming ? <Loader className="animate-spin" /> : <ArrowUp />}
          </Button>
        </div>
      </div>
      <UploadDialog
        isOpen={isAttachmentDialogOpen}
        onOpenChange={setIsAttachmentDialogOpen}
        attachmentInfo={attachmentInfo}
        setAttachmentInfo={setAttachmentInfo}
      />
    </div>
  );
};

const AttachmentInfoComponent = ({
  attachmentInfo,
  setAttachmentInfo,
}: {
  attachmentInfo: AttachmentInfo;
  setAttachmentInfo: (attachmentInfo: AttachmentInfo) => void;
}) => {
  console.log(attachmentInfo);
  return (
    <div>
      {attachmentInfo && (
        <button
          onClick={() => setAttachmentInfo(null)}
          className="flex items-center gap-2 text-xs border rounded-full py-1 px-2 border-primary text-primary"
        >
          {attachmentInfo.filename} <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ChatInputBox;

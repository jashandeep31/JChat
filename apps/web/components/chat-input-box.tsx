"use client";
import { SocketContext } from "@/context/socket-context";
import {
  AttachmentInfo,
  useChatInputBox,
} from "@/context/chat-input-box-context";
import { Button } from "@repo/ui/components/button";
import { ArrowUp, Globe, Loader2, Paperclip, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, {
  useEffect,
  useRef,
  useContext,
  useState,
  useCallback,
} from "react";
import { SelectAIModel } from "./select-ai-model";
import { UploadDialog } from "./upload-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useSession } from "next-auth/react";
import useUserQuery from "@/lib/react-query/use-user-query";
import { Badge } from "@repo/ui/components/badge";

const ChatInputBox = ({
  isStreaming = false,
  setIsStreaming,
}: {
  isStreaming?: boolean;
  setIsStreaming?: (value: boolean) => void;
}) => {
  const session = useSession();
  const params = useParams();
  const socket = useContext(SocketContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const parentDivRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [isChatBoxActive, setIsChatBoxActive] = useState(false);
  const { userQuery } = useUserQuery();

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

  const onSubmit = useCallback(() => {
    handleSubmit({
      setIsStreaming,
      socket,
      params,
    });
  }, [handleSubmit, setIsStreaming, socket, params]);

  useEffect(() => {
    if (!selectedModel || !selectedModel.imageAnalysis) {
      setAttachmentInfo(null);
    }
  }, [selectedModel, setAttachmentInfo]);

  useEffect(() => {
    if (!selectedModel || !selectedModel.webAnalysis) {
      setIsWebSearchEnabled(false);
    }
  }, [selectedModel, setIsWebSearchEnabled]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(e.target as Node) &&
        isChatBoxActive
      ) {
        setIsChatBoxActive(false);
      } else if (
        chatBoxRef.current &&
        chatBoxRef.current.contains(e.target as Node)
      ) {
        setIsChatBoxActive(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [chatBoxRef, isChatBoxActive]);

  useEffect(() => {
    if (isChatBoxActive) {
      window.addEventListener("keypress", (e: KeyboardEvent) => {
        if (isChatBoxActive && e.key === "Enter") {
          e.preventDefault();
          onSubmit();
        } else {
          textareaRef.current?.focus();
        }
      });
    }
  }, [isChatBoxActive, onSubmit]);

  return (
    <div
      ref={chatBoxRef}
      className={`border-2 border-b-0 rounded-b-none border-${isChatBoxActive ? "primary" : "accent"} p-4 rounded-md w-full flex gap-2 flex-col`}
    >
      <div ref={parentDivRef} className="flex-1" style={{ minHeight: "50px" }}>
        <textarea
          ref={textareaRef}
          className="border-0 outline-0 resize-none w-full flex-1"
          style={{
            overflowY: "auto",
            minHeight: "50px",
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
          {userQuery.data?.credits && userQuery.data?.credits <= 15 && (
            <Tooltip>
              <TooltipTrigger>
                <Badge className="border-red-500 text-red-500 bg-red-50 rounded-full hidden md:block">
                  Low Credits
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upgrade or buy more credits</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {selectedModel?.webAnalysis && (
            <Tooltip>
              <TooltipTrigger>
                <button
                  className={`flex items-center gap-2 text-xs text-muted-foreground border rounded-full py-1 px-2 ${
                    isWebSearchEnabled ? " text-primary border-primary " : ""
                  }`}
                  disabled={!session.data?.user?.proUser}
                  onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                  type="button"
                >
                  <Globe className="w-4 h-4" />{" "}
                  <span className="hidden md:block">Web Search</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {session.data?.user?.proUser ? (
                  <p>Enable web search to get information from the web</p>
                ) : (
                  <p>Upgrade to Pro to enable web search</p>
                )}
              </TooltipContent>
            </Tooltip>
          )}

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
                      disabled={!session.data?.user?.proUser}
                    >
                      <Paperclip className="w-4 h-4" />{" "}
                      <span className="hidden md:block">Attachment</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {session.data?.user?.proUser ? (
                      <p>
                        Upload files through the chat or other relevant
                        sections.
                      </p>
                    ) : (
                      <p>Upgrade to Pro to enable attachments</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
          {!isStreaming && (
            <Button
              disabled={
                userQuery.data?.credits
                  ? userQuery.data?.credits <= 0
                  : false || isStreaming
              }
              onClick={onSubmit}
            >
              <ArrowUp />
            </Button>
          )}
          {isStreaming && (
            <Button
              variant="outline"
              disabled={isStreaming}
              onClick={() => {
                socket?.emit("stop_streaming", {
                  cid: params.cid,
                });
              }}
            >
              <Loader2 className="animate-spin" />
            </Button>
          )}
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
          {attachmentInfo.filename.length > 20
            ? attachmentInfo.filename.slice(0, 20) + "..."
            : attachmentInfo.filename}{" "}
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ChatInputBox;

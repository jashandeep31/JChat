"use client";
import { SocketContext } from "@/context/socket-context";
import { useChatInputBox } from "@/context/chat-input-box-context";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  ArrowUp,
  Brain,
  ChevronDown,
  Eye,
  FileText,
  Globe,
  Loader,
} from "lucide-react";
import { useParams } from "next/navigation";
import Image from "next/image";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AiModel } from "@repo/db";

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
          <button
            className={`flex items-center gap-2 text-xs text-muted-foreground border rounded-full py-1 px-2 ${
              isWebSearchEnabled ? " text-primary border-primary " : ""
            }`}
            onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
            type="button"
          >
            <Globe className="w-4 h-4" /> Web Search
          </button>
          <Button onClick={onSubmit} disabled={isStreaming}>
            {isStreaming ? <Loader className="animate-spin" /> : <ArrowUp />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInputBox;

interface SelectAIModelProps {
  selectedModel: string | null;
  setSelectedModel: (model: string) => void;
  models: Array<AiModel>;
}

const SelectAIModel = ({
  selectedModel,
  setSelectedModel,
  models,
}: SelectAIModelProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-foreground hover:bg-accent transition-all rounded font-bold py-1 px-2">
          {selectedModel && models?.length
            ? models.find((model) => model.slug === selectedModel)?.name
            : "Select Model"}{" "}
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>AI Models</DropdownMenuLabel>
        {models?.map((model) => (
          <button
            key={model.slug}
            onClick={() => {
              setSelectedModel(model.slug);
              setOpen(false);
            }}
            className={`flex items-center p-2 gap-2 min-h-[50px] min-w-[400px] justify-between hover:bg-accent ${
              selectedModel === model.slug ? "bg-accent" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Image
                src={model.logo}
                width={12}
                height={12}
                alt={model.name}
                className="w-3 h-3"
                unoptimized={model.logo.startsWith("http")}
              />
              <span>
                {model.name}{" "}
                <span className="text-xs text-muted-foreground">
                  {model.credits} Credits
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {model.imageAnalysis && (
                <span>
                  <Eye className="text-orange-800 w-4 h-4" />
                </span>
              )}
              {model.pdfAnalysis && (
                <span>
                  <FileText className="text-green-800 w-4 h-4" />
                </span>
              )}
              {model.webAnalysis && (
                <span>
                  <Globe className="text-blue-800 w-4 h-4" />
                </span>
              )}
              {model.reasoning && (
                <span>
                  <Brain className="text-black w-4 h-4" />
                </span>
              )}
            </div>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

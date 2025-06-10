"use client";
import { SocketContext } from "@/context/socket-context";
import useModelsQuery from "@/lib/react-query/use-models-query";
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
  FileText,
  Globe,
  Loader,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useRef, useContext } from "react";

const ChatInputBox = ({
  isStreaming = false,
  setIsStreaming,
}: {
  isStreaming?: boolean;
  setIsStreaming?: (value: boolean) => void;
}) => {
  const params = useParams();
  const socket = useContext(SocketContext);
  const [question, setQuestion] = useState("what is next js in 10 words");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const parentDivRef = useRef<HTMLDivElement>(null);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);

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

  const handleSubmit = () => {
    if (!socket) return;
    if (setIsStreaming) setIsStreaming(true);
    if (params.cid) {
      socket.emit(
        "chat_question",
        JSON.stringify({
          cid: params.cid,
          question,
          isWebSearchEnabled,
        })
      );
    } else {
      socket.emit(
        "new_chat",
        JSON.stringify({
          question,
        })
      );
    }
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
        />
      </div>
      <div className="flex justify-between items-end">
        <div className="flex gap-2">
          <SelectAIModel />
          <button
            className={`flex items-center gap-2 text-xs text-muted-foreground border rounded-full py-1 px-2 ${
              isWebSearchEnabled ? " text-primary border-primary " : ""
            }`}
            onClick={() => setIsWebSearchEnabled((prev) => !prev)}
          >
            <Globe className="w-4 h-4" /> Web Search
          </button>
        </div>
        <Button onClick={handleSubmit} disabled={isStreaming}>
          {isStreaming ? <Loader className="animate-spin" /> : <ArrowUp />}
        </Button>
      </div>
    </div>
  );
};

export default ChatInputBox;

const SelectAIModel = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { modelsQuery } = useModelsQuery();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (selectedModel === null && modelsQuery.data) {
      setSelectedModel(modelsQuery.data[0].id);
    }
    return () => {};
  }, [modelsQuery.data, selectedModel]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-muted-foreground border rounded-full py-1 px-2">
          {selectedModel
            ? modelsQuery.data?.find((model) => model.id === selectedModel)
                ?.name
            : "Select Model"}{" "}
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuLabel>AI Models</DropdownMenuLabel>
        {modelsQuery.data?.map((model) => (
          <button
            key={model.id}
            onClick={() => {
              setSelectedModel(model.id);
              setOpen(false);
            }}
            className={`flex items-center p-2 gap-2 min-h-[50px] min-w-[400px] justify-between hover:bg-accent ${
              selectedModel === model.id ? "bg-accent" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={model.logo} className="w-3 h-3" alt="" />
              <span>
                {model.name}{" "}
                <span className="text-xs text-muted-foreground">
                  {model.credits} Credits
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {model.pdfAnalysis && (
                <span className="">
                  <FileText className="text-green-800 w-4 h-4" />
                </span>
              )}
              {model.webAnalysis && (
                <span className="">
                  <Globe className="text-blue-800 w-4 h-4" />
                </span>
              )}
              {model.reasoning && (
                <span className="">
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

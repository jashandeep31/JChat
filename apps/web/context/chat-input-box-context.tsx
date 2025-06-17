"use client";
import { createContext, useContext, useEffect, useState } from "react";
import useModelsQuery from "@/lib/react-query/use-models-query";
import { Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { AiModel } from "@repo/db";
import { toast } from "sonner";
export type AttachmentInfo = {
  id: string;
  uploadId: string;
  fileType: "IMAGE" | "PDF";
  filename: string;
} | null;
interface ChatInputBoxContext {
  question: string;
  setQuestion: (question: string) => void;
  isWebSearchEnabled: boolean;
  setIsWebSearchEnabled: (isWebSearchEnabled: boolean) => void;
  selectedModel: AiModel | null;
  setSelectedModel: (selectedModel: AiModel) => void;
  handleSubmit: (params: {
    isStreaming?: boolean;
    setIsStreaming?: (value: boolean) => void;
    socket: Socket | null;
    params: ReturnType<typeof useParams>;
  }) => void;
  models: Array<AiModel>;
  isAttachmentDialogOpen: boolean;
  setIsAttachmentDialogOpen: (isAttachmentDialogOpen: boolean) => void;
  attachmentInfo: AttachmentInfo;
  setAttachmentInfo: (attachmentInfo: AttachmentInfo) => void;
}

export const ChatInputBoxContext = createContext<ChatInputBoxContext | null>(
  null
);

export const ChatInputBoxProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [question, setQuestion] = useState("");
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);
  const { modelsQuery } = useModelsQuery();
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [attachmentInfo, setAttachmentInfo] = useState<AttachmentInfo>(null);
  // Set default model when models are loaded
  useEffect(() => {
    if (typeof window === "undefined") return;

    const selectedModelSlug = localStorage.getItem("selectedModel");

    if (selectedModelSlug && modelsQuery.data) {
      const model = modelsQuery.data.find(
        (model: AiModel) => model.slug === selectedModelSlug
      );
      if (model) {
        setSelectedModel(model);
        return;
      }
    }

    if (selectedModel === null && modelsQuery.data?.length) {
      setSelectedModel(
        modelsQuery.data.find(
          (model: AiModel) => model.slug === "gemini-2.0-flash"
        ) || null
      );
    }
  }, [modelsQuery.data, selectedModel]);
  const handleModelChange = (model: AiModel) => {
    setSelectedModel(model);
    if (typeof window === "undefined") return;
    localStorage.setItem("selectedModel", model.slug);
  };
  const handleSubmit = ({
    setIsStreaming,
    socket,
    params,
  }: {
    isStreaming?: boolean;
    setIsStreaming?: (value: boolean) => void;
    socket: Socket | null;
    params: ReturnType<typeof useParams>;
  }) => {
    if (!socket) return;
    if (question.length < 10) {
      toast.error("Question must be at least 10 characters long");
      return;
    }
    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }
    // Set streaming to true when starting the request

    setIsStreaming?.(true);
    setQuestion("");

    try {
      if (params?.cid) {
        socket.emit(
          "chat_question",
          JSON.stringify({
            cid: params.cid,
            question,
            modelSlug: selectedModel?.slug,
            isWebSearchEnabled,
            attachmentId: attachmentInfo?.id,
          })
        );
      } else if (params?.pid) {
        socket.emit(
          "new_chat",
          JSON.stringify({
            question,
            modelSlug: selectedModel?.slug,
            isWebSearchEnabled,
            attachmentId: attachmentInfo?.id,
            projectId: params.pid,
          })
        );
      } else {
        socket.emit(
          "new_chat",
          JSON.stringify({
            question,
            modelSlug: selectedModel?.slug,
            isWebSearchEnabled,
            attachmentId: attachmentInfo?.uploadId,
          })
        );
      }
    } catch (error) {
      // In case of error, make sure to set streaming to false
      setIsStreaming?.(false);
      console.error("Error submitting chat:", error);
    }
  };

  return (
    <ChatInputBoxContext.Provider
      value={{
        question,
        setQuestion,
        isWebSearchEnabled,
        setIsWebSearchEnabled,
        selectedModel,
        setSelectedModel: handleModelChange,
        handleSubmit,
        models: modelsQuery.data || [],
        isAttachmentDialogOpen,
        setIsAttachmentDialogOpen,
        attachmentInfo,
        setAttachmentInfo,
      }}
    >
      {children}
    </ChatInputBoxContext.Provider>
  );
};

export const useChatInputBox = () => {
  const context = useContext(ChatInputBoxContext);
  if (!context) {
    throw new Error(
      "useChatInputBox must be used within a ChatInputBoxProvider"
    );
  }
  return context;
};

"use client";
import { createContext, useContext, useEffect, useState } from "react";
import useModelsQuery from "@/lib/react-query/use-models-query";
import { Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { AiModel } from "@repo/db";
export type AttachmentInfo = {
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
  const [question, setQuestion] = useState("what is next js in 10 words");
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);
  const { modelsQuery } = useModelsQuery();
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [attachmentInfo, setAttachmentInfo] = useState<AttachmentInfo>(null);
  // Set default model when models are loaded
  useEffect(() => {
    if (selectedModel === null && modelsQuery.data?.length) {
      setSelectedModel(modelsQuery.data[0]);
    }
  }, [modelsQuery.data, selectedModel]);

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

    // Set streaming to true when starting the request

    setIsStreaming?.(true);

    try {
      if (params?.cid) {
        socket.emit(
          "chat_question",
          JSON.stringify({
            cid: params.cid,
            question,
            modelSlug: selectedModel?.slug,
            isWebSearchEnabled,
            attachmentId: attachmentInfo?.uploadId,
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
        setSelectedModel,
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

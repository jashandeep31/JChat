"use client";
import { createContext, useContext, useEffect, useState } from "react";
import useModelsQuery from "@/lib/react-query/use-models-query";
import { Socket } from "socket.io-client";
import { useParams } from "next/navigation";

interface ChatInputBoxContext {
  question: string;
  setQuestion: (question: string) => void;
  isWebSearchEnabled: boolean;
  setIsWebSearchEnabled: (isWebSearchEnabled: boolean) => void;
  selectedModel: string | null;
  setSelectedModel: (selectedModel: string) => void;
  handleSubmit: (params: {
    isStreaming?: boolean;
    setIsStreaming?: (value: boolean) => void;
    socket: Socket | null;
    params: ReturnType<typeof useParams>;
  }) => void;
  models: Array<{
    id: string;
    name: string;
    logo: string;
    credits: number;
    imageAnalysis?: boolean;
    pdfAnalysis?: boolean;
    webAnalysis?: boolean;
    reasoning?: boolean;
  }>;
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
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { modelsQuery } = useModelsQuery();

  // Set default model when models are loaded
  useEffect(() => {
    if (selectedModel === null && modelsQuery.data?.length) {
      setSelectedModel(modelsQuery.data[0].id);
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
            isWebSearchEnabled,
            model: selectedModel,
          })
        );
      } else {
        socket.emit(
          "new_chat",
          JSON.stringify({
            question,
            model: selectedModel,
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
        models: (modelsQuery.data || []).map((model) => ({
          id: model.id,
          name: model.name,
          logo: model.logo,
          credits: model.credits,
          imageAnalysis: model.imageAnalysis,
          pdfAnalysis: model.pdfAnalysis,
          webAnalysis: model.webAnalysis,
          reasoning: model.reasoning,
        })),
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

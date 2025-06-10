"use client";
import { AiModel } from "@repo/db";
import { createContext, useState } from "react";

interface ChatInputBoxContext {
  input: string;
  setInput: (input: string) => void;
  isWebSearchEnabled: boolean;
  setIsWebSearchEnabled: (isWebSearchEnabled: boolean) => void;
  selectedModel: AiModel | null;
  setSelectedModel: (selectedModel: AiModel) => void;
}

export const ChatInputBoxContext = createContext<ChatInputBoxContext | null>(
  null
);

export const ChatInputBoxProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [input, setInput] = useState("");
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);

  return (
    <ChatInputBoxContext.Provider
      value={{
        input,
        setInput,
        isWebSearchEnabled,
        setIsWebSearchEnabled,
        selectedModel,
        setSelectedModel,
      }}
    >
      {children}
    </ChatInputBoxContext.Provider>
  );
};

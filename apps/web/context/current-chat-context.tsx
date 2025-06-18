"use client";
import { useRouter } from "next/navigation";
import { createContext, useState, useContext } from "react";

interface CurrentChatContextType {
  chatId: string | null;
  setChatId: (chatId: string | null) => void;
  startNewChat: () => void;
}

const defaultContextValue: CurrentChatContextType = {
  chatId: null,
  setChatId: () => {},
  startNewChat: () => {},
};

export const CurrentChatContext =
  createContext<CurrentChatContextType>(defaultContextValue);

export const useCurrentChat = (): CurrentChatContextType => {
  const context = useContext(CurrentChatContext);
  if (context === undefined) {
    throw new Error("useCurrentChat must be used within a CurrentChatProvider");
  }

  return context;
};

export const CurrentChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [chatId, setChatId] = useState<string | null>(null);
  const startNewChat = () => {
    setChatId(null);
    router.push("/");
  };
  return (
    <CurrentChatContext.Provider value={{ chatId, setChatId, startNewChat }}>
      {children}
    </CurrentChatContext.Provider>
  );
};

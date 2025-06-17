"use client";
import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "@/context/socket-context";
import { ChatInputBoxProvider } from "@/context/chat-input-box-context";
import { SessionProvider } from "next-auth/react";
import { SearchDialogContextProvider } from "@/context/search-dialog-context";
import { CurrentChatProvider } from "@/context/current-chat-context";

const queryClient = new QueryClient();
const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <CurrentChatProvider>
          <SearchDialogContextProvider>
            <QueryClientProvider client={queryClient}>
              <ChatInputBoxProvider>
                <SocketProvider>{children}</SocketProvider>
              </ChatInputBoxProvider>
            </QueryClientProvider>
          </SearchDialogContextProvider>
        </CurrentChatProvider>
      </SessionProvider>
    </ThemeProvider>
  );
};

export default Provider;

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

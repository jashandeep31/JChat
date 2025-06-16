"use client";
import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "@/context/socket-context";
import { ChatInputBoxProvider } from "@/context/chat-input-box-context";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SearchDialogContextProvider } from "@/context/search-dialog-context";

const queryClient = new QueryClient();

const Provider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "O" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        router.push("/");
      }
    });

    return () => {
      window.removeEventListener("keydown", (e) => {
        if (e.key === "o" && e.ctrlKey && e.shiftKey) {
          console.log("Open sidebar");
        }
      });
    };
  }, [router]);
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <SearchDialogContextProvider>
          <QueryClientProvider client={queryClient}>
            <ChatInputBoxProvider>
              <SocketProvider>{children}</SocketProvider>
            </ChatInputBoxProvider>
          </QueryClientProvider>
        </SearchDialogContextProvider>
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

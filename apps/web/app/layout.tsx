import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JChat - Chat with Multiple AI Models",
  description:
    "Access and chat with various AI models including ChatGPT, Google Gemini, and Moe through a single interface",
  keywords: [
    "AI chat",
    "ChatGPT",
    "Google Gemini",
    "Moe",
    "artificial intelligence",
    "conversation",
    "language model",
    "chat interface",
    "AI assistant",
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" itemScope>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {" "}
        <Toaster richColors />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

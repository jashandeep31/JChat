"use client";
import React, { useEffect } from "react";
import { markdownComponents } from "./markdown-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { useTheme } from "next-themes";

const MarkdownRenderer = ({ content }: { content: string }) => {
  // Check if highlight.js is already loaded to avoid duplicate injections
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!document.querySelector('link[href*="highlight.js"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      if (resolvedTheme === "light") {
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-light.min.css";
      } else {
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.min.css";
      }
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [resolvedTheme]);

  return (
    <div className="max-w-[800px]">
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

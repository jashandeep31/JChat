import React, { useEffect } from "react";
import { markdownComponents } from "./markdown-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";

const MarkdownRenderer = ({ content }: { content: string }) => {
  // Check if highlight.js is already loaded to avoid duplicate injections
  useEffect(() => {
    if (!document.querySelector('link[href*="highlight.js"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.min.css";
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, []);

  return (
    <ReactMarkdown
      components={markdownComponents}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;

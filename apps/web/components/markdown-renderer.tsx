import React from "react";
import { markdownComponents } from "./markdown-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
const MarkdownRenderer = ({ content }: { content: string }) => {
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

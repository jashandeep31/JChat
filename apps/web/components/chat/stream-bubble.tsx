import React from "react";
import MarkdownRenderer from "../markdown-renderer";
import { Loader } from "lucide-react";

const StreamBubble = ({ content }: { content: string }) => {
  return (
    <div>
      {content.trim() ? (
        <MarkdownRenderer content={content} />
      ) : (
        <Loader className="animate-spin" />
      )}
    </div>
  );
};

export default StreamBubble;

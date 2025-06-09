import React from "react";
import MarkdownRenderer from "../markdown-renderer";

const AnswerBubble = ({ content }: { content: string }) => {
  return (
    <div>
      <MarkdownRenderer content={content} />
    </div>
  );
};

export default AnswerBubble;

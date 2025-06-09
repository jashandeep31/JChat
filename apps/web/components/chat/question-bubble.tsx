import React from "react";

const QuestionBubble = ({ content }: { content: string }) => {
  return (
    <div className="flex justify-end">
      <div className="bg-accent p-3 rounded-md lg:max-w-2/3">{content}</div>
    </div>
  );
};

export default QuestionBubble;

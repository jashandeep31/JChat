import ChatInputBox from "@/components/chat-input-box";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1"></div>
      <div className="p-4 flex justify-center">
        <ChatInputBox />
      </div>
    </div>
  );
};

export default page;

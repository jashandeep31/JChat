import ChatInputBox from "@/components/chat-input-box";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1"></div>
      <div className="flex justify-center">
        <div className="lg:w-1/2">
          <ChatInputBox />
        </div>
      </div>
    </div>
  );
};

export default page;

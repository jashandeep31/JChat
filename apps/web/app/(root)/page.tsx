import ChatInputBox from "@/components/chat-input-box";
import DummyQuestions from "@/components/chat/dummy-questions";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col min-h-screen md:p-0 p-4">
      <div className="flex-1 justify-center flex ">
        <div className="lg:max-w-800px lg:pt-24 md:pt-16 py-6">
          <DummyQuestions />
        </div>
      </div>
      <div className="flex justify-center  ">
        <div className="lg:w-1/2 flex-1 w-full">
          <ChatInputBox />
        </div>
      </div>
    </div>
  );
};

export default page;

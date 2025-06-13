import QuestionBubble from "@/components/chat/question-bubble";
import MarkdownRenderer from "@/components/markdown-renderer";
import { db } from "@/lib/db";
import React from "react";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;

  const chatShareLink = await db.chatShareLink.findUnique({
    where: {
      id: id,
    },
  });

  if (!chatShareLink) {
    return <div>Chat not found</div>;
  }

  const chat = await db.chat.findUnique({
    where: {
      id: chatShareLink.chatId,
    },
    include: {
      ChatQuestion: {
        include: {
          ChatQuestionAnswer: true,
        },
      },
    },
  });

  if (!chat) {
    return <div>Chat not found</div>;
  }

  return (
    <div className="">
      <div className="border-b p-4">
        <h1 className="text-lg font-medium text-center">Title: {chat.name}</h1>
      </div>
      <div className="lg:max-w-[800px] mt-6 flex flex-col justify-center mx-auto">
        {chat.ChatQuestion.length > 0 ? (
          <div className="flex flex-col gap-4 p-4">
            {chat.ChatQuestion.map((question) => (
              <div key={question.id} className="">
                <QuestionBubble content={question.question} />
                <MarkdownRenderer
                  content={question.ChatQuestionAnswer[0].answer}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>No questions found</div>
        )}
      </div>
    </div>
  );
};

export default page;

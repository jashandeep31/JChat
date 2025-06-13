import { db } from "@/lib/db";
import React from "react";
import { SharedQuestionBubble } from "@/components/shared/shared-question-bubble";
import { SharedAnswerBubble } from "@/components/shared/shared-answer-bubble";
import { SharedChatHeader } from "@/components/shared/shared-chat-header";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;

  const chatShareLink = await db.chatShareLink.findUnique({
    where: {
      id: id,
    },
  });

  if (!chatShareLink) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chat Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The shared chat you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
        </div>
      </div>
    );
  }

  const chat = await db.chat.findUnique({
    where: {
      id: chatShareLink.chatId,
    },
    include: {
      ChatQuestion: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          ChatQuestionAnswer: true,
        },
      },
    },
  });

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chat Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The shared chat you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      <SharedChatHeader
        title={chat.name}
        createdAt={chat.createdAt}
        questionCount={chat.ChatQuestion.length}
      />

      <div className="max-w-4xl mx-auto mt-6 px-4">
        {chat.ChatQuestion.length > 0 ? (
          <div className="space-y-8">
            {chat.ChatQuestion.map((question) => (
              <div
                key={question.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                <div className=" ">
                  <SharedQuestionBubble content={question.question} />
                </div>
                <div className="">
                  <SharedAnswerBubble answers={question.ChatQuestionAnswer} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-8 text-center rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Messages Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This shared chat doesn&apos;t contain any messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;

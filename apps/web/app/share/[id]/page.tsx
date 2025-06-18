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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Chat Not Found
          </h2>
          <p className="text-muted-foreground">
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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Chat Not Found
          </h2>
          <p className="text-muted-foreground">
            The shared chat you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
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
                className="bg-card rounded-lg shadow-sm overflow-hidden"
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
          <div className="bg-card p-8 text-center rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Messages Found
            </h3>
            <p className="text-muted-foreground">
              This shared chat doesn&apos;t contain any messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;

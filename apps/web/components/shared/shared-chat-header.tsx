"use client";
import React from "react";
import { CalendarIcon, MessageSquare } from "lucide-react";

interface SharedChatHeaderProps {
  title: string;
  createdAt?: Date | string | null;
  questionCount: number;
}

export const SharedChatHeader = ({
  title,
  createdAt,
  questionCount,
}: SharedChatHeaderProps) => {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 rounded-t-lg shadow-sm">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span>
              {questionCount} {questionCount === 1 ? "message" : "messages"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

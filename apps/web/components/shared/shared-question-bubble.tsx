"use client";
import React from "react";

export const SharedQuestionBubble = ({ content }: { content: string }) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800 mb-2">
      <div className="flex items-start gap-3">
        <div className="bg-blue-600 text-white p-2 rounded-full flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-user"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-full">
          <p className="m-0 text-gray-800 dark:text-gray-200">{content}</p>
        </div>
      </div>
    </div>
  );
};

"use client";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { Code, Compass, GraduationCap, WandSparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useContext, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { SocketContext } from "@/context/socket-context";
import { toast } from "sonner";

const categories = [
  {
    id: "create",
    label: "Create",
    icon: WandSparkles,
    examples: [
      { id: "create-1", text: "Can you help me create a blog post about AI?" },
      { id: "create-2", text: "Write a short story about time travel" },
      { id: "create-3", text: "Design a landing page for my startup" },
      {
        id: "create-4",
        text: "Generate a social media post about sustainability",
      },
      {
        id: "create-5",
        text: "Help me write a cover letter for a job application",
      },
    ],
  },
  {
    id: "explore",
    label: "Explore",
    icon: Compass,
    examples: [
      { id: "explore-1", text: "What's the history of quantum computing?" },
      { id: "explore-2", text: "Tell me about the most distant galaxies" },
      { id: "explore-3", text: "How do deep sea creatures survive?" },
      {
        id: "explore-4",
        text: "Explain the cultural significance of the Great Wall of China",
      },
      {
        id: "explore-5",
        text: "What are the most incredible natural wonders on Earth?",
      },
    ],
  },
  {
    id: "code",
    label: "Code",
    icon: Code,
    examples: [
      {
        id: "code-1",
        text: "How do I create a React hook for form validation?",
      },
      {
        id: "code-2",
        text: "Explain the differences between var, let, and const in JavaScript",
      },
      {
        id: "code-3",
        text: "Write a Python function to sort a dictionary by values",
      },
      {
        id: "code-4",
        text: "What's the best way to implement authentication in Next.js?",
      },
      {
        id: "code-5",
        text: "Show me examples of effective API error handling",
      },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    icon: GraduationCap,
    examples: [
      { id: "learn-1", text: "Explain machine learning in simple terms" },
      { id: "learn-2", text: "How does the human memory work?" },
      {
        id: "learn-3",
        text: "What are the principles of effective communication?",
      },
      { id: "learn-4", text: "Give me a beginner's guide to investing" },
      { id: "learn-5", text: "Explain how blockchain technology works" },
    ],
  },
];
const DummyQuestions = () => {
  const session = useSession();
  const [activeTab, setActiveTab] = useState("create");
  const socket = useContext(SocketContext);
  // Function to handle tab navigation
  const handleTabChange = (categoryId: string) => {
    setActiveTab(categoryId);
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      console.log(`Selected category: ${category.label}`);
      // You can add your specific function call here
    }
  };

  // Get the examples for the selected category
  const activeExamples =
    categories.find((cat) => cat.id === activeTab)?.examples || [];

  if (
    session.status === "loading" ||
    session.status === "unauthenticated" ||
    !session.data
  )
    return null;

  return (
    <div>
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-text-deep-purple mb-10 sm:mb-12 text-center sm:text-left">
          How can I help you, {session.data.user.name}?
        </h1>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="mb-12 sm:mb-16"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 h-auto w-full   bg-transparent">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base bg-primary/10 border-transparent hover:bg-primary/20 text-primary h-12 sm:h-14 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:shadow-md"
              >
                {React.createElement(category.icon, {
                  className:
                    "h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-105 transition-transform",
                })}
                <span className="font-medium">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-1">
          {activeExamples.map((example, index) => (
            <Button
              key={example.id}
              variant="ghost"
              onClick={() => {
                if (!socket) {
                  toast.error("Error in establishing connection");
                  return;
                }
                socket.emit(
                  "new_chat",
                  JSON.stringify({
                    question: example.text,
                    modelSlug: "gemini-2.0-flash",
                    isWebSearchEnabled: false,
                    attachmentId: "",
                    projectId: "",
                  })
                );
              }}
              className={cn(
                "w-full justify-start px-0 py-4 sm:py-5 text-foreground hover:text-primary/70 transition-colors text-base sm:text-lg font-medium hover:bg-transparent",
                index !== activeExamples.length - 1 && "border-b border-muted"
              )}
            >
              {example.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DummyQuestions;

// No longer needed as components have been replaced with Tabs and Button components

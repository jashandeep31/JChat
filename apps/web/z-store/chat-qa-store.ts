import { create } from "zustand";
import { ChatQuestion, ChatQuestionAnswer } from "@prisma/client";

export interface FullQuestion extends ChatQuestion {
  ChatQuestionAnswer: ChatQuestionAnswer[];
}

interface ChatQAStore {
  currentChatId: string;
  allQuestions: Record<string, FullQuestion[]>;
  questions: FullQuestion[];
  setChatId: (chatId: string) => void;
  addQuestion: (chatId: string, question: FullQuestion) => void;
  getQuestionsOfChat: (chatId: string) => FullQuestion[];
  addMultipleQuestions: (chatId: string, questions: FullQuestion[]) => void;
  appendAnswerToQuestion: (
    chatId: string,
    questionId: string,
    answer: ChatQuestionAnswer
  ) => void;
}

export const useChatQAStore = create<ChatQAStore>((set, get) => ({
  currentChatId: "",
  allQuestions: {},
  questions: [],

  setChatId: (newChatId: string) => {
    const all = get().allQuestions;
    set({
      currentChatId: newChatId,
      questions: all[newChatId] || [],
    });
  },

  getQuestionsOfChat: (chatId: string) => {
    return get().allQuestions[chatId] || [];
  },

  addMultipleQuestions: (chatId: string, questions: FullQuestion[]) => {
    const { allQuestions } = get();
    const existing = allQuestions[chatId] || [];
    const existingIds = new Set(existing.map((q) => q.id));
    const newQs = questions.filter((q) => !existingIds.has(q.id));
    const sorted = [...existing, ...newQs].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    set({
      allQuestions: { ...allQuestions, [chatId]: sorted },
    });
    if (get().currentChatId === chatId) {
      set({ questions: sorted });
    }
  },

  addQuestion: (chatId: string, question: FullQuestion) => {
    const { allQuestions } = get();
    const updated = [...(allQuestions[chatId] || []), question];
    set({
      allQuestions: { ...allQuestions, [chatId]: updated },
    });
    if (get().currentChatId === chatId) {
      set({ questions: updated });
    }
  },

  appendAnswerToQuestion: (
    chatId: string,
    questionId: string,
    answer: ChatQuestionAnswer
  ) => {
    const { allQuestions, currentChatId } = get();
    const chatQs = allQuestions[chatId] || [];
    const updatedQs = chatQs.map((q) => {
      if (q.id !== questionId) return q;
      // Prevent duplicate answers
      const exists = q.ChatQuestionAnswer.some((a) => a.id === answer.id);
      if (exists) return q;
      return { ...q, ChatQuestionAnswer: [...q.ChatQuestionAnswer, answer] };
    });
    set({ allQuestions: { ...allQuestions, [chatId]: updatedQs } });
    if (currentChatId === chatId) {
      set({ questions: updatedQs });
    }
  },
}));

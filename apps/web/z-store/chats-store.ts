import { Chat } from "@repo/db";
import { create } from "zustand";

interface ChatsStore {
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  removeChat: (chatId: string) => void;
  updateChatName: (chatId: string, name: string) => void;
  updateChat: (chat: Chat) => void;
  updateChatProject: (chatId: string, projectId: string) => void;
}

export const useChatsStore = create<ChatsStore>((set, get) => ({
  chats: [],

  setChats: (chats: Chat[]) => {
    const map = new Map(chats.map((c) => [c.id, c]));
    const unique = Array.from(map.values());
    unique.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    set({ chats: unique });
  },

  addChat: (chat: Chat) => {
    const { chats } = get();
    const filtered = chats.filter((c) => c.id !== chat.id);
    const updated = [chat, ...filtered];
    updated.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    set({ chats: updated });
  },

  updateChat: (chat: Chat) => {
    const { chats } = get();
    const updatedList = chats.map((c) => (c.id === chat.id ? chat : c));
    updatedList.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    set({ chats: updatedList });
  },

  updateChatProject: (chatId: string, projectId: string) => {
    const { chats } = get();
    const updatedList = chats.map((chat) =>
      chat.id === chatId ? { ...chat, projectId, updatedAt: new Date() } : chat
    );
    updatedList.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    set({ chats: updatedList });
  },

  removeChat: (chatId: string) => {
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
    }));
  },

  updateChatName: (chatId: string, name: string) => {
    const { chats } = get();
    const updatedList = chats.map((chat) =>
      chat.id === chatId ? { ...chat, name, updatedAt: new Date() } : chat
    );
    updatedList.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    set({ chats: updatedList });
  },
}));

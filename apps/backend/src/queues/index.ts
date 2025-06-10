import { Server } from "socket.io";
import { renameChatQueue } from "./rename-chat-queue.js";

let ioInstance: Server | null = null;

export function initializeQueues(io: Server) {
  ioInstance = io;
}

export function getIO() {
  if (!ioInstance) {
    throw new Error(
      "Socket.IO instance not initialized. Call initializeQueues first."
    );
  }
  return ioInstance;
}

export { renameChatQueue } from "./rename-chat-queue.js";

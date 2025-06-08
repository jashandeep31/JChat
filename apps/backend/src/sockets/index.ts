import { Socket } from "socket.io";
import { newChatHandler } from "./events/new-chat-handler.js";
import { joinChatHandler } from "./events/join-chat-handler.js";
import { chatQuestionHandler } from "./events/chat-question-handler.js";

export const socketHandler = (socket: Socket) => {
  socket.on("new_chat", (data) => newChatHandler(socket, data));
  socket.on("join_chat", (data) => joinChatHandler(socket, data));
  socket.on("chat_question", (data) => chatQuestionHandler(socket, data));
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
};

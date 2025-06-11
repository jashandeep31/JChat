import { Socket } from "socket.io";
import { newChatHandler } from "./events/new-chat-handler.js";
import { joinChatHandler } from "./events/join-chat-handler.js";
import { chatQuestionHandler } from "./events/chat-question-handler.js";
import { Server } from "socket.io";
import { reAnswerRequestHandler } from "./events/re-answer-handler.js";

export const socketHandler = (socket: Socket, io: Server) => {
  try {
    socket.on("new_chat", (data) => newChatHandler({ socket, io, data }));
    socket.on("join_chat", (data) => joinChatHandler({ socket, io, data }));
    socket.on("chat_question", (data) =>
      chatQuestionHandler({ socket, io, data })
    );
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    socket.on("re_answer", (data) => {
      reAnswerRequestHandler({ socket, io, data });
    });
  } catch (e) {
    socket.emit("error", "Something went wrong");
  }
};

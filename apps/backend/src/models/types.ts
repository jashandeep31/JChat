import { Server, Socket } from "socket.io";

export type ModelProvider = "ollama" | "openai" | "anthropic" | "gemini";

export type SocketFunctionParams = {
  socket: Socket;
  io: Server;
  data: any;
};

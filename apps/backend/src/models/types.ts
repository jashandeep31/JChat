import { Server, Socket } from "socket.io";

export type SocketFunctionParams = {
  socket: Socket;
  io: Server;
  data: any;
};

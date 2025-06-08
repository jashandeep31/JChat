import { Socket } from "socket.io";
export const joinChatHandler = (socket: Socket, data: string) => {
  console.log(data);
  const cid = data;
  console.log(cid);
};

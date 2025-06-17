import { SocketFunctionParams } from "../../models/types.js";

export const leaveChatHandler = ({
  socket,
  io,
  data,
}: SocketFunctionParams) => {
  socket.leave(`room:${data}`);
};

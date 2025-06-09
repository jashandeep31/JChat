import app from "./app.js";
import { env } from "./lib/env.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { socketHandler } from "./sockets/index.js";

const PORT = env.PORT;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    credentials: true,
  },
});
io.use((socket, next) => {
  socket.userId = "0784bd0c-1d9f-40b5-83b6-31d323cb832d";
  next();
});

io.on("connection", socketHandler);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

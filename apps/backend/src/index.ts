import app from "./app.js";
import { env } from "./lib/env.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { socketHandler } from "./sockets/index.js";
import { initializeQueues } from "./queues/index.js";

const PORT = env.PORT;
const server = createServer(app);

// Initialize Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.use((socket, next) => {
  socket.userId = "1945b260-5c8a-4134-862f-8e255d34c7e6";
  next();
});

// Initialize queues with io instance
initializeQueues(io);

// Handle socket connections
io.on("connection", (socket) => socketHandler(socket, io));

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

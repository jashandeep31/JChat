import app from "./app.js";
import { env } from "./lib/env.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { socketHandler } from "./sockets/index.js";
import { initializeQueues } from "./queues/index.js";
import { redis } from "./lib/db.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const PORT = env.PORT;
const server = createServer(app);
redis.flushall();
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.use((socket, next) => {
  const raw = socket.handshake.headers.cookie || "";
  const { ["jwt-token"]: jwtToken } = cookie.parse(raw);
  if (!jwtToken) return next(new Error("Authentication error"));
  try {
    const decoded = jwt.verify(jwtToken, "secret");
    socket.userId = (decoded as any).user.id;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
});

// Initialize queues with io instance
initializeQueues(io);

// Handle socket connections
io.on("connection", (socket) => socketHandler(socket, io));

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

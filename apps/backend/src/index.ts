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
const ALLOWED_URLS =
  process.env.ALLOWED_URLS?.split(",").map((u) => u.trim()) ?? [];

export const io = new Server(server, {
  cors: {
    origin: ALLOWED_URLS,
    credentials: true,
  },
});

await redis.set("test", "test");
console.log(`we didi it 
  `);
io.use((socket, next) => {
  try {
    const raw = socket.handshake.headers.cookie || "";
    const { ["jwt-token"]: jwtToken } = cookie.parse(raw);
    if (!jwtToken) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(jwtToken, env.JWT_SECRET);
      socket.userId = (decoded as any).user.id;
      next();
    } catch (error) {
      console.error("Socket JWT verification error:", error);
      next(new Error("Authentication error"));
    }
  } catch (error) {
    console.error("Socket middleware error:", error);
    next(new Error("Server error"));
  }
});

// Wrap initialization in try-catch blocks to prevent server crashes
try {
  // Initialize queues with io instance
  initializeQueues(io);

  // Handle socket connections with error handling
  io.on("connection", (socket) => {
    try {
      socketHandler(socket, io);

      // Handle socket errors
      socket.on("error", (error) => {
        console.error(`Socket error for userId ${socket.userId}:`, error);
        // Socket errors are handled but don't crash the server
      });
    } catch (error) {
      console.error("Error in socket connection handler:", error);
      // Don't rethrow - keep server running
    }
  });

  // Handle socket.io server errors
  io.engine.on("connection_error", (err) => {
    console.error("Socket.io connection error:", err);
  });

  // Start the server with error handling
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle server-level errors
  server.on("error", (error) => {
    console.error("HTTP Server error:", error);
    // Server continues running despite the error
  });
} catch (error) {
  console.error("Critical server initialization error:", error);
  // Even if initialization fails, we try to start the server anyway
  try {
    server.listen(PORT, () => {
      console.log(`Server running in recovery mode on port ${PORT}`);
    });
  } catch (serverError) {
    console.error("Failed to start server in recovery mode:", serverError);
  }
}

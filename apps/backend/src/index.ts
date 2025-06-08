import app from "./app.js";
import { env } from "./lib/env.js";
import { Server } from "socket.io";
import { createServer } from "node:http";

const PORT = env.PORT;
const server = createServer(app);

const io = new Server(server);
io.on("connection", (socket) => {
  console.log("a user connected");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

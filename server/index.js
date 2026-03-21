import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

import { createRelayHub } from "./relay-hub.js";
import { createSocketController } from "./socket-controller.js";

const port = Number(process.env.PORT || 3000);
const dev = process.argv.includes("--dev");
const app = next({ dev, dir: process.cwd() });
const handle = app.getRequestHandler();

const hub = createRelayHub();
let io;

function send(socket, payload) {
  if (!socket) {
    return;
  }

  socket.emit("server-event", payload);
}

function sendError(clientId, error) {
  send(io?.sockets.sockets.get(clientId), {
    type: "error",
    message: error?.message || "Unexpected server error."
  });
}

await app.prepare();

const server = createServer((request, response) => {
  handle(request, response);
});

io = new SocketIOServer(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  },
  transports: ["websocket"]
});

const controller = createSocketController({
  hub,
  sendToClient(clientId, payload) {
    send(io.sockets.sockets.get(clientId), payload);
  },
  getConnectedClientIds() {
    return [...io.sockets.sockets.keys()];
  }
});

io.on("connection", (socket) => {
  send(socket, { type: "session-ready", clientId: socket.id });

  socket.on("client-event", (payload) => {
    try {
      controller.onMessage(socket.id, payload);
    } catch (error) {
      sendError(socket.id, error);
    }
  });

  socket.on("disconnect", () => {
    controller.onDisconnect(socket.id);
  });
});

server.listen(port, () => {
  console.log(`Anonymous chat is running at http://localhost:${port}`);
});

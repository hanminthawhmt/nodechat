const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./env");
const messagesService = require("../domains/messages/messages.service");

const onlineUsers = new Map();
const initSocket = (httpServer) => {
  // create socket.io server and attaches to the httpServer
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  // socket middleware
  io.use((socket, next) => {
    // in http we get the jwt token from the header
    // in socket.io we get the jwt token from the handshake
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("No token provided"));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // same pattern as req.user, attach the decoded object to the socket, so all event handler can access it
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new Error("Token expired"));
      }
      return next(new Error("Invalid token"));
    }
  });

  // main event listen for socket.io
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.email}`);
    // store mapping when user connects
    onlineUsers.set(socket.user.id, socket.id);

    // join a room
    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`${socket.user.email} joined room: ${room}`);
    });

    // send a message
    socket.on("send_message", async ({ room, receiverId, content }) => {
      try {
        const message = await messagesService.saveMessage({
          senderId: socket.user.id,
          receiverId: receiverId || null,
          room: room || null,
          content: content,
        });
        if (room) {
          // group message — broadcast to room
          socket.to(room).emit("receive_message", message);
        } else {
          const receiverSocketId = onlineUsers.get(receiverId);
          if (receiverSocketId) {
            // DM — emit only to receiver's socket
            io.to(receiverSocketId).emit("receive_message", message);
          }
          socket.emit("receive_message", message);
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.user.id);
      console.log(`User disconnected: ${socket.user.email}`);
    });
  });
  return io;
};

module.exports = initSocket;

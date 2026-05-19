const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./env");

const initSocket = (httpServer) => {
  // create socket io server and attaches to the httpServer
  const io = new Server(httpServer, {
    cors: "*",
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

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.email}`);

    // join a room
    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`${socket.user.email} joined room: ${room}`);
    });

    // send a message
    socket.on("send_message", async (data) => {
      const { room, content } = data;

      const message = {
        sender: socket.user.id,
        senderEmail: socket.user.email,
        content,
        room,
        createdAt: new Date(),
      };

      // broadcast to everyone in the room except sender
      socket.to(room).emit("receive_message", message);
    });
    
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.email}`);
    });
  });
  return io;
};

module.exports = initSocket;

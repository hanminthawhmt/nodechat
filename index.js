const { PORT } = require("./src/config/env");
const app = require("./src/app");
const { initSocket } = require("./src/config/socket");
const http = require("http");

const httpServer = http.createServer(app);
const { io, onlineUsers } = initSocket(httpServer);
httpServer.listen(PORT, () => {
  console.log(`Server is listening on PORT `, PORT);
});

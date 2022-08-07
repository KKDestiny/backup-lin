import { Server } from "socket.io";
import { getAuthCode } from "../caches/configs";

// middlewares
import authMiddleware from "./middlewares/auth.middleware";

// Controllers
import echoController from "./controllers/echo.controller";

function wsServer(server) {
  const io = new Server(server, {
    /* options */
  });

  console.log("authcode", getAuthCode());

  // middlewares
  io.use(authMiddleware);

  io.on("connection", socket => {
    // Controllers
    socket.on("echo", echoController.echo);
  });

  return io;
}

export default wsServer;

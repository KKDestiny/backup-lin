import { Server } from "socket.io";
import { getAuthCode } from "../caches/configs";

// middlewares
import authMiddleware from "./middlewares/auth.middleware";

// Controllers
import echoController from "./controllers/echo.controller";
import backupController from "./controllers/backup.controller";

function wsServer(server) {
  const io = new Server(server, {
    /* options */
    // 允许上传的文件最大size
    // https://socket.io/how-to/upload-a-file#maxhttpbuffersize-limit
    maxHttpBufferSize: 1e8, // 100MB
  });

  console.log("authcode", getAuthCode());

  // middlewares
  io.use(authMiddleware);

  io.on("connection", socket => {
    socket.on("connection", data => {
      console.log("connection", data);
    });

    // Controllers
    socket.on("echo", echoController.echo);

    socket.on("POST backup/list", backupController.backupList);
  });

  return io;
}

export default wsServer;

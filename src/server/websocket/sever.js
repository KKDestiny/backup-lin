import { Server } from "socket.io";
import { getAuthCode } from "../caches/configs";

// middlewares
import authMiddleware from "./middlewares/auth.middleware";

// Controllers
import echoController from "./controllers/echo.controller";
import backupController from "./controllers/backup.controller";

async function updateClients(io) {
  const sockets = await io.fetchSockets();
  const list = sockets.reduce((temp, data) => {
    temp.push({ id: data.id, address: data.handshake.address });
    return temp;
  }, []);
  io.emit("refresh-clientlist", list);
}

function wsServer(server) {
  const io = new Server(server, {
    /* options */
    // 允许通信的最大数据
    // https://socket.io/how-to/upload-a-file#maxhttpbuffersize-limit
    maxHttpBufferSize: 100 * 1024 * 1024 * 1024, // 100GB
  });

  console.log("[authcode]", getAuthCode());

  // middlewares
  io.use(authMiddleware);

  // New Client Connected
  io.on("connection", async socket => {
    console.log("[New Client Connected]", socket.id, socket.handshake.address);
    await updateClients(io);

    socket.on("disconnect", async () => {
      console.log("[Client Disconnected]", socket.id);
      await updateClients(io);
    });

    socket.on(`proxy/msg-center`, async data => {
      const { cmd, clientId, payload } = data;
      console.log(
        `[proxy/msg-center]`,
        `Msg from ${socket.id} to ${clientId}`,
        cmd
      );
      io.emit(`proxy/client/${clientId}`, { cmd, payload });
    });

    // Controllers
    socket.on("echo", echoController.echo);

    socket.on("POST backup/list", backupController.backupList);
    socket.on("POST backup/pictures", backupController.backupPictures);
    socket.on("POST backup/lin", backupController.backupLIN);
  });

  return io;
}

export default wsServer;

// yarn add --dev socket.io-client

import { io } from "socket.io-client";

const socket = io("ws://10.19.20.10:18000", {
  auth: {
    token: "123",
  },
});
// console.log(socket)
socket.on("connect", () => {
  console.log("connected");
});
socket.on("connect_error", reason => {
  console.log(reason);
});

socket.emit("echo", "hello world1", res => {
  console.log(res);
});

socket.on("disconnect", reason => {
  console.log(reason);
});

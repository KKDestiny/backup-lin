/*
 * @Date: 2022-02-28 22:56:04
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import http from "http";
import app from "../server/app";
import ws from "../server/websocket/sever";

import { getIPAddress, generateQrSVG } from "../utils/server.util";
import { getAuthCode } from "../server/caches/configs";

const server = http.createServer(app);
let socketIOServer = null;

let listeningPort = null;

// APIs //////////////////////////////////////////
export async function startHttpServer(port = 18000) {
  return new Promise(resolve => {
    try {
      if (server !== null && server.listening) {
        const url = `http://${getIPAddress()}:${listeningPort}`;
        return resolve({ data: url });
      }

      server.listen(port, err => {
        if (err) {
          return resolve({ errors: err });
        }
        listeningPort = port;
        const url = `http://${getIPAddress()}:${port}`;
        console.log("Express serves at:", url);

        socketIOServer = ws(server);
        console.log(
          `socket.io connected at: ws://${getIPAddress()}:${listeningPort}`
        );
        resolve({ data: url });
      });
    } catch (err) {
      resolve({ errors: err });
    }
  });
}

export async function stopHttpServer() {
  return new Promise(resolve => {
    try {
      if (!server || !server.listening) {
        return resolve({ data: { stopped: true, flag: "not running" } });
      }

      if (socketIOServer) {
        socketIOServer.close();
      }

      server.close(err => {
        if (err) {
          return resolve({ errors: err });
        }
        resolve({ data: { stopped: true } });
      });
    } catch (err) {
      resolve({ errors: err });
    }
  });
}

export async function getHttpServerStatus() {
  if (!server || !server.listening) {
    return { url: null, svg: null, status: "ready" };
  }

  const authcode = getAuthCode();
  const url = `http://${getIPAddress()}:${listeningPort}?authcode=${authcode}`;
  const ws = `ws://${getIPAddress()}:${listeningPort}?authcode=${authcode}`;
  const svgRes = await generateQrSVG(url);
  const svgWSRes = await generateQrSVG(ws);
  return {
    url,
    svg: svgRes.data,
    wsSvg: svgWSRes.data,
    authcode,
    status: "running",
  };
}

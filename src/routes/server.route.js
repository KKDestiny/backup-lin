/*
 * @Date: 2022-02-28 22:36:27
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import { ipcMain } from "electron";
import {
  getIPAddress,
  startHttpServer,
} from "../controllers/server.controller";

const TAG = "[ROUTE.SERVER]";
const ENBALE_PRINT = true;
const print = (...msg) => {
  if (!ENBALE_PRINT) {
    return;
  }
  console.log(...msg);
};

let httpServer = null;

class RouterServer {
  constructor() {
    this.IP_START = "/server/start";
  }

  /**
   * 启动服务
   */
  startServer() {
    const ipcId = this.IP_START;
    ipcMain.on(ipcId, async (event, arg) => {
      print(TAG, ipcId, arg);
      const { data = {} } = arg;
      const _requestData = Object.assign({}, arg);

      // 启动服务
      const { port } = data;
      const res = await startHttpServer(port);
      const ipAddress = getIPAddress();

      event.sender.send(ipcId, {
        data: {
          res,
          ipAddress,
        },
        _requestData,
      });
    });
  }

  /**
   * 监听器
   * 新的监听器必须加入这里进行初始化，否则无法监听到渲染进程的事件
   */
  monitor() {
    this.startServer();
  }
}

export default new RouterServer();

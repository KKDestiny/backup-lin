/*
 * @Date: 2020-07-27 15:49:42
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import { ipcMain } from "electron";

import { echo } from "../controllers/common.controller";

const TAG = "[ROUTE.COMMON]";
const ENBALE_PRINT = true;
const print = (...msg) => {
  if (!ENBALE_PRINT) {
    return;
  }
  console.log(...msg);
};

class RouterCommon {
  constructor() {
    this.IPC_ECHO = "/get/echo";
  }

  /**
   * 切换host
   */
  echo() {
    const ipcId = this.IPC_ECHO;
    ipcMain.on(ipcId, async (event, arg) => {
      print(TAG, ipcId, arg);
      const { data } = arg;
      const _requestData = Object.assign({}, arg);
      event.sender.send(ipcId, {
        data: {
          request: echo(data),
          response: "Response from background process",
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
    this.echo();
  }
}

export default new RouterCommon();

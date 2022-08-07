/*
 * @Date: 2021-11-05 17:12:42
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import path from "path";
import fs from "fs-extra";
import { ipcMain, BrowserWindow, dialog } from "electron";
import { homedir } from "os";

import configure, { winConfig } from "../config/configure";
import { getLatestLog } from "../config/devlogs";

import { generateSeed } from "../utils/server.util";
import {
  startHttpServer,
  stopHttpServer,
  getHttpServerStatus,
} from "../controllers/server.controller";
import { configHttpServer } from "../server/caches/configs";

const latestLog = getLatestLog();

const TAG = "[ROUTE.SYSTEM]";
const ENBALE_PRINT = true;
const print = (...msg) => {
  if (!ENBALE_PRINT) {
    return;
  }
  console.log(...msg);
};

class RouterCommon {
  constructor() {
    // 设置数据
    this.IPC_GET_SOFTWARE_INFO = "GET /system/software";

    // 打开一个新窗口
    this.IPC_GET_NEW_WINDOW = "GET /system/new-window";
    this.IPC_GET_COMMON_FILE_PATH = "GET /system/file-paths"; // 选择一个或多个文件
    this.IPC_GET_COMMON_ONE_FILE_PATH = "GET /system/file-paths/one"; // 选择一个文件
    this.IPC_POST_COMMON_COPY_FILE = "POST /system/copy/file"; // 复制一个文件
    this.IPC_DELETE_COMMON_COPY_FILE = "DELETE /system/file"; // 删除一个文件

    this.IPC_BP_START_HTTP_SERVER = "START /system/http-server"; // 启动HTTP服务器
    this.IPC_BP_STOP_HTTP_SERVER = "STOP /system/http-server"; // 关闭HTTP服务器
    this.IPC_BP_HTTP_SERVER_CONFIG = "PUT /system/http-server/config"; // 配置HTTP服务器参数
  }

  /**
   * 存储用户token
   */
  async getSoftwareInfo() {
    const ipcId = this.IPC_GET_SOFTWARE_INFO;
    ipcMain.on(ipcId, async (event, arg) => {
      print(TAG, ipcId, arg);
      const _requestData = Object.assign({}, arg);
      event.sender.send(ipcId, {
        data: {
          beginYear: configure.beginYear,

          fullName: configure.fullName,
          rootPath: configure.rootPath,
          author: configure.author,
          authorWebsite: configure.authorWebsite,

          MAGIC_CODE: configure.MAGIC_CODE,

          isProductionMode: configure.ENV_PRODUCTION,

          latestLog,
        },
        _requestData,
      });
    });
  }

  /**
   * 打开一个新窗口
   */
  async openANewWindow() {
    const ipcId = this.IPC_GET_NEW_WINDOW;
    ipcMain.on(ipcId, async (event, arg) => {
      print(TAG, ipcId, arg);
      const _requestData = Object.assign({}, arg);
      const window = new BrowserWindow(winConfig);

      const { data = {} } = arg;
      const { page } = data;
      const entranceDir = configure.ENV_DEV_TOOL ? "src" : "dist";
      const pageUrl = path.join(
        __dirname,
        `../../${entranceDir}/views/${page}.html`
      );
      if (!fs.pathExistsSync(pageUrl)) {
        return event.sender.send(ipcId, {
          errors: { message: "page not found" },
          _requestData,
        });
      }

      console.log(arg, pageUrl);
      window.loadFile(pageUrl);
      event.sender.send(ipcId, {
        data: { success: true },
        _requestData,
      });

      // 开发者模式
      if (configure.ENV_DEV_TOOL) {
        window.webContents.openDevTools();
      }
    });
  }

  chooseFiles() {
    const ipcId = this.IPC_GET_COMMON_FILE_PATH;
    ipcMain.on(ipcId, async (event, arg = {}) => {
      print(TAG, ipcId, arg);
      const _requestData = Object.assign({}, arg);
      // 选择文件
      const defaultPath = `${homedir()}/Desktop/`;
      const options = {
        title: "选择图片或文件",
        message: "选择图片或文件",
        defaultPath,
        properties: ["openFile", "multiSelections", "createDirectory"],
        filters: [
          { name: "任意类型", extensions: ["*"] },
          // { name: "图片", extensions: ["jpg", "png", "gif", "bmp"] },
          // { name: "视频", extensions: ["mkv", "avi", "mp4"] },
          // { name: "PDF", extensions: ["pdf"] },
        ],
      };
      const result = (await dialog.showOpenDialog(options)) || {};
      const { canceled, filePaths } = result;
      if (result.errors) {
        return event.sender.send(ipcId, {
          errors: result.errors,
          _requestData,
        });
      }

      const filePathsInfo = filePaths.reduce((temp, filepath) => {
        const extname = path.extname(filepath).replace(".", "");
        const info = {
          filename: path.basename(filepath),
          extname,
          filepath,
        };
        temp.push(info);
        return temp;
      }, []);
      event.sender.send(ipcId, {
        data: { canceled, filePaths: filePathsInfo },
        _requestData,
      });
    });
  }

  chooseAFile() {
    const ipcId = this.IPC_GET_COMMON_ONE_FILE_PATH;
    ipcMain.on(ipcId, async (event, arg = {}) => {
      print(TAG, ipcId, arg);
      const _requestData = Object.assign({}, arg);

      const data = arg.data || {};
      const filters = data.filters || [
        { name: "任意类型", extensions: ["*"] },
        // { name: "图片", extensions: ["jpg", "png", "gif", "bmp"] },
        // { name: "视频", extensions: ["mkv", "avi", "mp4"] },
        // { name: "PDF", extensions: ["pdf"] },
      ];
      // 选择文件
      const defaultPath = `${homedir()}/Desktop/`;
      const options = {
        title: "选择图片或文件",
        message: "选择图片或文件",
        defaultPath,
        properties: ["openFile", "createDirectory"],
        filters,
      };
      const result = (await dialog.showOpenDialog(options)) || {};
      const { canceled, filePaths } = result;
      if (result.errors) {
        return event.sender.send(ipcId, {
          errors: result.errors,
          _requestData,
        });
      }

      if (filePaths.length === 0) {
        event.sender.send(ipcId, {
          data: { canceled, filepath: null },
          _requestData,
        });
      }
      const filepath = filePaths[0];
      const extname = path.extname(filepath).replace(".", "");
      const info = {
        filename: path.basename(filepath),
        extname,
        filepath,
      };
      event.sender.send(ipcId, {
        data: { canceled, filepath: info },
        _requestData,
      });
    });
  }

  /**
   * 启动HTTP服务器
   */
  startHttpServer() {
    const ipcId = this.IPC_BP_START_HTTP_SERVER;
    ipcMain.on(ipcId, async (event, arg) => {
      print(TAG, ipcId, arg);
      const _requestData = Object.assign({}, arg);
      try {
        const { port } = arg.data;
        const result = await startHttpServer(port);
        console.log(`startHttpServer`, result.data);

        const httpServer = await getHttpServerStatus();
        event.sender.send(ipcId, {
          data: {
            ...httpServer,
            httpServerStatus: httpServer.status,
          },
          _requestData,
        });
      } catch (err) {
        event.sender.send(ipcId, {
          errors: err,
          _requestData,
        });
      }
    });
  }

  /**
   * 关闭HTTP服务器
   */
  stopHttpServer() {
    const ipcId = this.IPC_BP_STOP_HTTP_SERVER;
    ipcMain.on(ipcId, async (event, arg) => {
      print(TAG, ipcId, arg);
      const _requestData = Object.assign({}, arg);
      try {
        await stopHttpServer();
        const httpServer = await getHttpServerStatus();
        event.sender.send(ipcId, {
          data: {
            ...httpServer,
            httpServerStatus: httpServer.status,
          },
          _requestData,
        });
      } catch (err) {
        event.sender.send(ipcId, {
          errors: err,
          _requestData,
        });
      }
    });
  }

  /**
   * 配置HTTP服务器参数
   */
  configHttpServer() {
    const ipcId = this.IPC_BP_HTTP_SERVER_CONFIG;
    ipcMain.on(ipcId, async (event, arg) => {
      print(TAG, ipcId, arg);
      const _requestData = Object.assign({}, arg);
      try {
        const res = await configHttpServer(arg.data);
        event.sender.send(ipcId, {
          data: {
            ...res,
          },
          _requestData,
        });
      } catch (err) {
        event.sender.send(ipcId, {
          errors: err,
          _requestData,
        });
      }
    });
  }

  /**
   * 监听器
   * 新的监听器必须加入这里进行初始化，否则无法监听到渲染进程的事件
   */
  monitor() {
    // 设置
    this.getSoftwareInfo();
    this.openANewWindow();
    this.chooseFiles(); // 选择一个或多个文件
    this.chooseAFile(); // 选择一个文件

    this.startHttpServer(); // 启动HTTP服务器
    this.stopHttpServer(); // 关闭http服务器
    this.configHttpServer(); // 配置HTTP服务器参数
  }
}

export default new RouterCommon();

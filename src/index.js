import { app, BrowserWindow, Menu, shell, Notification } from "electron";
import * as path from "path";
import { Server } from "socket.io";

import Configure, { winConfig } from "./config/configure";
import { getLatestLog } from "./config/devlogs";

// Routes
import commonRouter from "./routes/common.route";
import systemRouter from "./routes/system.route";
import serverRouter from "./routes/server.route";

const isMac = process.platform === "darwin";
let mainWindow = null;

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),

  // 编辑
  {
    label: "编辑",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]
        : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
    ],
  },

  // 视图
  {
    label: "视图",
    submenu: [
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
      ...(Configure.ENV_DEV_TOOL
        ? [{ type: "separator" }, { role: "toggleDevTools" }]
        : []),
    ],
  },

  // 关于
  {
    label: "关于",
    submenu: [
      {
        label: "林晓州",
        click: async () => {
          await shell.openExternal("https://www.linxiaozhou.com");
        },
      },
      { type: "separator" },
      {
        label: "关于工具箱",
        click: async () => {
          const latestlog = getLatestLog();
          const aboutMe = `${Configure.description}\n\n当前版本：${latestlog.ver}\n更新日期：${latestlog.date}\n更新内容：${latestlog.dev}`;
          new Notification({
            title: Configure.fullName,
            body: aboutMe,
          }).show();
        },
      },
    ],
  },
];

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow(winConfig);

  // 初始化数据区域
  const loadPage = "index";

  // and load the index.html of the app.
  const entranceDir = Configure.ENV_DEV_TOOL ? "src" : "dist";
  mainWindow.loadFile(
    path.join(__dirname, `../${entranceDir}/views/${loadPage}.html`)
  );

  // 直接全屏
  mainWindow.maximize();

  // 开发者模式
  if (Configure.ENV_DEV_TOOL) {
    mainWindow.webContents.openDevTools();
  }

  // 工具栏
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

export const getMainWindow = () => {
  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const io = new Server(3000, {
  /* options */
});
io.on("connection", socket => {
  console.log("socket.io connected");
  socket.on("hello", (arg, callback) => {
    console.log(arg); // "world"
    callback("got it");
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
commonRouter.monitor();
systemRouter.monitor();
serverRouter.monitor();

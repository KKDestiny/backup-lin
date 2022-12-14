/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/*
 * @Date: 2022-07-25 01:48:28
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
const clientSockectIO = require("socket.io-client").io;
const globals = new GlobalToolsClass();
const systemInst = new SystemModel({ globals });
globals.setGlobal("systemInst", systemInst);
globals.setGlobal("dayjs", require("dayjs"));
globals.setGlobal("marked", marked);
globals.setGlobal("bootstrap", bootstrap);

let httpServerInfo = {};
let socket = null;
let rootPath = "";
let pictureRoot = "";
let appRoot = "";

/**
 * 显示页面
 */
async function showHomePage() {
  refreshHttpServerStatus();
}

function monitWinowSizeChange() {
  const height = globals.$(window).height() - 150;
  globals.$("#net-col").css("height", `${height}px`);
  globals.$("#info-col").css("height", `${height}px`);
}

function refreshHttpServerStatus() {
  if (httpServerInfo.status === "running") {
    // 运行中
    globals.$("#http-server-modal-btn").text("关闭服务");
    globals.$("#http-server-modal-btn").attr("onclick", "stopHttpServer()");
    globals.$("#http-server-modal-port").attr("disabled", "disabled");
    globals.$("#http-configs").show();
  } else {
    // if (httpServerStatusInfo === "ready") {
    // 可用
    globals.$("#http-server-modal-btn").text("启动服务");
    globals.$("#http-server-modal-btn").attr("onclick", "startHttpServer()");
    globals.$("#http-server-modal-port").attr("disabled", null);
    globals.$("#http-configs").hide();
  }

  const { url, svg, wsSvg } = httpServerInfo || {};

  if (!url) {
    globals.$("#http-server-modal-url").html("");
  } else {
    const link = `
      <div style="margin-top: 6px;">
        <a class="hover-text inverse" onclick="globals.openExternalLink('${url}')">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> ${url}
        </a>
      </div>
    `;
    globals.$("#http-server-modal-url").html(
      `
        <div style="width: 100%; margin-top: 4px;">二维码</div>
        <div class="small-text" style="margin-top: 4px;"><i class="fa-solid fa-circle-question"></i> 使用孤岛笔记app扫描下面二维码</div>
      `
    );
  }

  if (!svg) {
    globals.$("#http-server-modal-svg").html("");
  } else {
    globals.$("#http-server-modal-svg").html(`${svg}`);
  }

  if (!wsSvg) {
    globals.$("#http-server-modal-svg-ws").html("");
  } else {
    globals
      .$("#http-server-modal-svg-ws")
      .html(
        `<div style="width: 100%; margin-top: 4px; margin-bottom: 10px;">WebSocket</div>${wsSvg}`
      );
    globals.$("#http-server-modal-svg-ws").hide();
  }
}

async function startHttpServer() {
  const _port = globals.$("#http-server-modal-port").val();
  const port = parseInt(_port);
  if (isNaN(port)) {
    return simpleWarning("端口号无效", true);
  }
  const data = { port };
  globals.disableBtnById("http-server-modal-btn", "启动中...");
  const res = await systemInst.startHttpServer(data);
  console.log("systemInst.startHttpServer", res);
  globals.recoverBtnById("http-server-modal-btn");
  if (res.errors) {
    return globals.simpleDanger("无法启动http服务", true);
  }
  if (res.data) {
    httpServerInfo = res.data;
    globals.simpleSuccess(`启动成功！<br>服务器地址: ${httpServerInfo.url}`);
    refreshHttpServerStatus();
  }

  await connect2SocketServer();
  return res.data;
}

async function connect2SocketServer() {
  const { ws, authcode } = httpServerInfo;
  socket = clientSockectIO(ws, {
    auth: {
      token: authcode,
    },
  });

  socket.on("connect", () => {
    console.log("[ws connected]");
    globals.$(`#manager-status-icon`).css("color", "rgb(1, 202, 122)");
  });
  socket.on("connect_error", reason => {
    console.log("[ws connect_error]", reason);
    globals.$(`#manager-status-icon`).css("color", "#EF0000");
    updateClients([]);
  });
  socket.on("disconnect", reason => {
    console.log("[ws disconnect]", reason);
    globals.$(`#manager-status-icon`).css("color", "#888");
    updateClients([]);
  });

  // 刷新客户端列表
  socket.on("refresh-clientlist", data => {
    console.log("[refresh-clientlist", data);

    const clients = data.reduce((temp, client) => {
      if (client.id === socket.id) return temp;
      temp.push(client);
      return temp;
    }, []);
    updateClients(clients);
  });
}

function updateClients(clients) {
  let list = "";
  if (clients.length === 0) {
    list = `<div class="small-text">没有已连接的客户端</div>`;
  } else {
    list = clients.reduce((temp, client) => {
      const address = client.address.replace("::ffff:", "");
      const defaultPath = `Download/LIN/download`;
      temp += `
        <a class="list-group-item inverse" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${address}</h5>
            <small>${client.id}</small>
          </div>
          <p class="mb-1" style="margin-top: 6px;">
            <span onclick="sendFiles('${client.id}')" class="btn btn-sm btn-pink ">发送文件</span>
            <input id="${client.id}-destpath" value="${defaultPath}" class="form-control inverse form-control-sm" style="display: inline-block; width: 300px;" />

            <span class="float-end btn-group">
              <span onclick="syncPictures('${client.id}')" class="btn btn-sm btn-dark">同步图片</span>
              <span onclick="syncLIN('${client.id}')" class="btn btn-sm btn-dark">同步APP数据</span>
            </span>
          </p>
        </a>
      `;
      return temp;
    }, "");
  }
  globals.$(`#socket-client-list`).html(list);
}

function syncPictures(clientId) {
  const data = {
    cmd: "sync-pictures",
    clientId,
    payload: {},
  };
  console.log(`[syncPictures]`, clientId, data);
  sendMsg2Client(clientId, data);
}

function syncLIN(clientId) {
  const data = {
    cmd: "sync-lin",
    clientId,
    payload: {},
  };
  console.log(`[syncLIN]`, clientId, data);
  sendMsg2Client(clientId, data);
}

function sendMsg2Client(clientId, data) {
  socket.emit(`proxy/msg-center`, data, result => {
    console.log(`[sendMsg2Client]`, clientId, result);
  });
}

async function sendFiles(clientId) {
  const res = await systemInst.chooseFiles();
  console.log(res);
  const list = res?.data?.filePaths;
  if (!Array.isArray(list) || list.length === 0) {
    return;
  }

  const fs = require("fs-extra");
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    const stat = await fs.stat(element.filepath);
    const destDirname = globals.$(`#${clientId}-destpath`).val();
    if (stat.size > 1024 * 1024 * 5) {
      // 大于5MB的文件需由手机端自行下载
      const data = {
        cmd: "send-file-cmd",
        clientId,
        payload: {
          destDirname,
          filename: element.filename,
          filepath: globals.formatPath(element.filepath),
          size: stat.size,
        },
      };
      console.log(`[syncLIN.just-send-cmd]`, clientId, data);
      sendMsg2Client(clientId, data);
      continue;
    }

    // 小文件直接通过websocket的Buffer传输
    const file = await fs.readFile(element.filepath);
    const data = {
      cmd: "send-file",
      clientId,
      payload: { destDirname, filename: element.filename, file },
    };
    console.log(`[syncLIN]`, clientId, data);
    sendMsg2Client(clientId, data);
  }
}

async function stopHttpServer() {
  globals.disableBtnById("http-server-modal-btn", "正在关闭服务器...");
  const res = await systemInst.stopHttpServer();
  globals.recoverBtnById("http-server-modal-btn");
  console.log("systemInst.stopHttpServer", res);
  if (res.errors) {
    return globals.simpleDanger("无法关闭http服务", true);
  }
  httpServerInfo = res.data;
  globals.simpleSuccess(`关闭成功！`);
  refreshHttpServerStatus();
}

function openBackupDir() {
  globals.openFilesystemPath(globals.formatPath(rootPath));
}
function openBackupPicDir() {
  globals.openFilesystemPath(globals.formatPath(pictureRoot));
}
function openBackupLINDir() {
  globals.openFilesystemPath(globals.formatPath(appRoot));
}

// 初始化
globals.$(async function () {
  // 初始化页面
  const data = await globals.initPage(true);
  rootPath = data.rootPath;
  pictureRoot = `${rootPath}/pictures`;
  appRoot = `${rootPath}/lin-backup`;

  // 窗口尺寸
  monitWinowSizeChange();
  $(window).resize(function () {
    monitWinowSizeChange();
  });

  // 显示页面
  await showHomePage();
});

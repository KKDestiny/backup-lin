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
      temp += `
        <a class="list-group-item inverse" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${address}</h5>
            <small>已连接</small>
          </div>
          <p class="mb-1"></p>
          <small>${client.id}</small>
        </a>
      `;
      return temp;
    }, "");
  }
  globals.$(`#socket-client-list`).html(list);
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

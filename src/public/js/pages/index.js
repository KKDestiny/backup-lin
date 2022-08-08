/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/*
 * @Date: 2022-07-25 01:48:28
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
const globals = new GlobalToolsClass();
const systemInst = new SystemModel({ globals });
globals.setGlobal("systemInst", systemInst);
globals.setGlobal("dayjs", require("dayjs"));
globals.setGlobal("marked", marked);
globals.setGlobal("bootstrap", bootstrap);

let httpServerInfo = {};

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
    globals.$("#http-server-modal-url").html(
      `
          <div class="small-text"><i class="fa-solid fa-circle-question"></i> 击下面链接，或用客户端app扫描二维码后保存打开的网页</div>
          <div style="margin-top: 6px;">
            <a class="hover-text inverse" onclick="globals.openExternalLink('${url}')">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> ${url}
            </a>
          </div>
        `
    );
  }

  if (!svg) {
    globals.$("#http-server-modal-svg").html("");
  } else {
    globals
      .$("#http-server-modal-svg")
      .html(
        `<div style="width: 100%; margin-top: 4px; margin-bottom: 10px;">Http</div>${svg}`
      );
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
  return res.data;
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

// 初始化
globals.$(async function () {
  // 初始化页面
  await globals.initPage(true);

  // 窗口尺寸
  monitWinowSizeChange();
  $(window).resize(function () {
    monitWinowSizeChange();
  });

  // 显示页面
  await showHomePage();
});

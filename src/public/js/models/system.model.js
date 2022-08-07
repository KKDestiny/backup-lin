/*
 * @Date: 2020-07-19 23:48:54
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
// eslint-disable-next-line no-undef, @typescript-eslint/no-unused-vars
class SystemModel extends BaseModel {
  constructor(options = {}) {
    // IPC 通道
    const ipcIds = {
      // 设置数据
      IPC_GET_SOFTWARE_INFO: "GET /system/software",

      // 打开一个新窗口
      IPC_GET_NEW_WINDOW: "GET /system/new-window",

      // 选择一个或多个文件
      IPC_GET_COMMON_FILE_PATH: "GET /system/file-paths",

      // 选择一个文件
      IPC_GET_COMMON_ONE_FILE_PATH: "GET /system/file-paths/one",

      // 从本地复制一个文件到目标地址
      IPC_POST_COMMON_COPY_FILE: "POST /system/copy/file",

      // 删除一个文件
      IPC_DELETE_COMMON_COPY_FILE: "DELETE /system/file",

      // http服务器
      IPC_BP_START_HTTP_SERVER: "START /system/http-server", // 启动HTTP服务器
      IPC_BP_STOP_HTTP_SERVER: "STOP /system/http-server", // 关闭HTTP服务器
      IPC_BP_HTTP_SERVER_CONFIG: "PUT /system/http-server/config", // 配置HTTP服务器参数
    };
    super(ipcIds, { globals: options.globals });

    this.globals = options.globals;

    // 私有数据初始化
    // ...
  }

  getSoftwareInfo(data) {
    return new Promise(resolve => {
      const ipcId = this.IPC_IDS.IPC_GET_SOFTWARE_INFO;
      this.globals.print(`[REQUEST] ${ipcId}`, "info");
      this.globals.ipcSend(
        ipcId,
        this.globals.buildCommonSendData({
          data,
          eventIndicator: this.setCallbackQueueById(ipcId, {
            success: resolve,
            failed: resolve,
          }),
        })
      );
    });
  }

  openANewWindow(data) {
    return new Promise(resolve => {
      const ipcId = this.IPC_IDS.IPC_GET_NEW_WINDOW;
      this.globals.print(`[REQUEST] ${ipcId}`, "info");

      this.globals.ipcSend(
        ipcId,
        this.globals.buildCommonSendData({
          data,
          eventIndicator: this.setCallbackQueueById(ipcId, {
            success: resolve,
            failed: resolve,
          }),
        })
      );
    });
  }

  chooseFiles(data) {
    const ipcId = this.IPC_IDS.IPC_GET_COMMON_FILE_PATH;
    return this.commonSend(ipcId, data);
  }

  chooseAFile(data) {
    const ipcId = this.IPC_IDS.IPC_GET_COMMON_ONE_FILE_PATH;
    return this.commonSend(ipcId, data);
  }

  copyAFile(sourcePath) {
    const ipcId = this.IPC_IDS.IPC_POST_COMMON_COPY_FILE;
    return this.commonSend(ipcId, { sourcePath });
  }

  deleteAFile(sourcePath) {
    const ipcId = this.IPC_IDS.IPC_DELETE_COMMON_COPY_FILE;
    return this.commonSend(ipcId, { sourcePath });
  }

  startHttpServer(data) {
    const ipcId = this.IPC_IDS.IPC_BP_START_HTTP_SERVER;
    return this.commonSend(ipcId, data);
  }
  stopHttpServer(data) {
    const ipcId = this.IPC_IDS.IPC_BP_STOP_HTTP_SERVER;
    return this.commonSend(ipcId, data);
  }
  configHttpServer(data) {
    const ipcId = this.IPC_IDS.IPC_BP_HTTP_SERVER_CONFIG;
    return this.commonSend(ipcId, data);
  }
}

/*
 * @Date: 2020-07-19 23:48:54
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
class DemoModel extends BaseModel {
  constructor() {
    // IPC 通道
    const ipcIds = {
      IPC_ECHO: "/get/echo",
    };
    super(ipcIds);

    // 私有数据初始化
    // ...
  }

  echo(data) {
    return new Promise(resolve => {
      const ipcId = this.IPC_IDS.IPC_ECHO;
      ToolsPublicInst.print(`[REQUEST] ${ipcId}`, "info");
      ToolsPublicInst.ipcSend(
        ipcId,
        ToolsPublicInst.buildCommonSendData({
          data,
          eventIndicator: this.setCallbackQueueById(ipcId, {
            success: resolve,
            failed: resolve,
          }),
        })
      );
    });
  }
}

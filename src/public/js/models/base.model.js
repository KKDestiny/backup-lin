/*
 * @Date: 2020-07-19 23:48:54
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
class BaseModel {
  constructor(ipcIds = {}, options = {}) {
    this.globals = options.globals;

    // IPC 通道
    this.IPC_IDS = ipcIds;

    // 回调
    this.callbackMaps = {};

    // 初始化回调及监听器
    for (const key in this.IPC_IDS) {
      const ipcId = this.IPC_IDS[key];

      // 初始化回调队列
      this.callbackMaps[ipcId] = {};

      // 初始化消息监听
      this.globals.ipcRenderer.on(ipcId, (event, arg) => {
        const style = arg.errors ? "red" : "green";
        let code = "200 -";
        if (arg.errors) {
          code = `${arg.errors.status} -`;
        }
        this.globals.print(`[RESPONSE] ${code} ${ipcId}`, style);
        // console.log(ipcId, arg);

        if (!arg) {
          return;
        }

        const { errors, data, response } = arg;
        const _requestData = arg._requestData || {};
        const { eventIndicator } = _requestData;
        let callbackMap = this.getCallbackMapById(ipcId, eventIndicator) || {};

        // 错误
        if (errors) {
          if (callbackMap.failed) {
            callbackMap.failed({
              errors,
              _requestData,
              response,
            });
            this.deleteCallbackMapById(ipcId, eventIndicator);
          } else {
            console.log(errors);
          }
          return;
        }

        // 成功
        if (callbackMap.success) {
          if (this.IPC_IDS.IPC_ACCOUNT_DO_LOGIN === ipcId) {
            callbackMap.success({
              data: arg,
              response,
              _requestData,
            });
          } else {
            callbackMap.success({
              ...arg,
              _requestData,
            });
          }
          this.deleteCallbackMapById(ipcId, eventIndicator);
        } else {
          console.log(data, response, _requestData);
        }
      });
    }

    // 私有数据初始化
    // ...
  }

  /**
   * 生成事件识别Id
   */
  genIPCEventIndicator() {
    return this.globals.generateSeed();
  }

  /**
   * 获取指定事件的回调方法
   * @param {*} id
   * @param {*} eventIndicator
   */
  getCallbackMapById(id, eventIndicator) {
    const ipcMap = this.callbackMaps[id] || {};
    return ipcMap[eventIndicator];
  }

  /**
   * 删除指定事件的回调
   * @param {*} id
   * @param {*} eventIndicator
   */
  deleteCallbackMapById(id, eventIndicator) {
    if (!this.callbackMaps) {
      return false;
    }
    if (!this.callbackMaps[id]) {
      return false;
    }
    if (!this.callbackMaps[id][eventIndicator]) {
      return false;
    }

    delete this.callbackMaps[id][eventIndicator];
    return true;
  }

  /**
   * 设置回调方法，返回事件识别id
   * @param {*} id
   * @param {*} callback
   */
  setCallbackQueueById(id, callback) {
    if (!id || !callback) {
      return null;
    }
    if (!this.callbackMaps[id]) {
      this.callbackMaps[id] = {};
    }
    const realCallback = {
      failed: callback.failed,
      success: callback.success || callback,
    };

    const eventIndicator = this.genIPCEventIndicator();
    this.callbackMaps[id][eventIndicator] = realCallback;
    return eventIndicator;
  }

  commonSend(ipcId, data) {
    return new Promise(resolve => {
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
  sendWithCB(ipcId, data, callbak) {
    this.globals.print(`[REQUEST] ${ipcId}`, "info");
    const eventIndicator = this.setCallbackQueueById(ipcId, {
      success: callbak,
      failed: callbak,
    });
    this.globals.ipcSend(
      ipcId,
      this.globals.buildCommonSendData({
        data,
        eventIndicator,
      })
    );
    return eventIndicator;
  }
}

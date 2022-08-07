/*
 * @Date: 2020-07-16 23:22:13
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
// import request from "request";
const request = require("request");

// 打印
const ENBALE_PRINT = true;
const print = (...msg) => {
  if (!ENBALE_PRINT) {
    return;
  }
  console.log(...msg);
};

class RequestClass {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  /**
   * 执行请求
   * @param {Object} options 配置
   * @param {*} callback 回调
   * @param {*} forceprint 打印
   */
  doRequest(options, callback, forceprint) {
    // Refer: https://github.com/request/request
    const fullOptions = Object.assign(options, {
      headers: {
        Authorization: this.token,
      },
    });
    request(fullOptions, (error, rawdata = {}) => {
      if (!error) {
        const statusCode = rawdata.statusCode;
        const headers = rawdata.headers;
        const body = rawdata.body;
        if (forceprint) {
          console.log(`statusCode:${statusCode}`);
          console.log(headers);
          console.log(body);
        }
        callback(rawdata);
      } else {
        print(fullOptions.url, error);
        callback(rawdata);
      }
    });
  }

  /**
   * 基础请求
   * @param {*} urlPrefix 请求服务前缀
   * @param {*} method 方法
   * @param {*} route 路由
   * @param {*} rawdata 数据
   * @param {*} tag 标记
   */
  baseRequest(urlPrefix, method, route, rawdata, tag) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    return new Promise(resolve => {
      const url = urlPrefix + route;
      const options = {
        url,
        method,
        body: rawdata,
        json: true,
      };
      this.doRequest(options, (res = {}) => {
        print(
          `[${res.statusCode}] [RequestClass.${tag}]`,
          `${JSON.stringify(options)}\n`
        );
        if (res.statusCode >= 500) {
          resolve({
            errors: {
              status: res.statusCode,
              message: res.body,
            },
          });
        }
        Object.assign(res.body, {
          statusCode: res.statusCode,
        });
        resolve(res.body);
      });
    }).catch(err => err);
  }

  /**
   * 账户相关请求
   */
  async accountRequest(endpoint, method, route, rawdata) {
    const result = this.baseRequest(
      endpoint,
      method,
      route,
      rawdata,
      "accountRequest"
    );
    return result;
  }
}

export default new RequestClass();

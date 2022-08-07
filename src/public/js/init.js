/*
 * @Date: 2020-07-18 00:49:04
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
class GlobalClass {
  constructor(configs = {}) {
    // 用户配置 ////////////////////////////////
    // 注意！用户配置会被下面的核心库等配置覆盖
    Object.entries(configs).reduce((temp, [field, config]) => {
      this[field] = config;
      return temp;
    }, 0);

    // 常量 ////////////////////////////////
    this.DATETIME_FORMAT = DATETIME_FORMAT;
    this.DATE_FORMAT = DATE_FORMAT;

    // 核心库 ////////////////////////////////
    /**
     * Electron
     */
    this.electron = electron;
    /**
     * Electron IPC Renderer
     */
    this.ipcRenderer = ipcRenderer;

    // 第三方库 ////////////////////////////////
    /**
     * jQuery
     */
    this.$ = $;
    /**
     * ECharts
     */
    try {
      this.echarts = echarts;
    } catch (err) {
      // console.log("echarts not support");
    }
    /**
     * ECharts
     */
    try {
      this.lodash = require("lodash");
    } catch (err) {
      // console.log("lodash not support");
    }

    // 方法 ////////////////////////////////try {
    try {
      this.field = {
        getValueByPath,
      };
    } catch (err) {
      // console.log("monthly not support");
    }

    /**
     * 月度报表处理方法集
     */
    try {
      this.monthly = {
        sumTwoSchedule,
        isMonthlySchedule,
        isValidMonthlySchedule,
        total: getSummaryValueFromScheduleLoss,
      };
    } catch (err) {
      // console.log("monthly not support");
    }
    /**
     * 年度报表处理方法集
     */
    try {
      this.annually = {
        sumTwoAnnualSchedule,
        isValidAnnualSchedule,
        isAnnualSchedule,
      };
    } catch (err) {
      // console.log("annually not support");
    }

    // JSON Viewer Options
    this.jsonViewerOptions = {
      collapsed: true,
      rootCollapsable: false,
      withLinks: false,
    };

    // 常量定义
    this.CONSTS = {};

    // 组件库
    this.component = {};

    // 按钮管理
    this._btns = {};
  }

  disableBtn(name, text = "数据获取中...") {
    this._btns[name] = this.$(`[name="${name}"]`).html();
    this.$(`[name="${name}"]`).addClass("disabled");
    this.$(`[name="${name}"]`).html(text);
  }
  enableBtn(name, text) {
    this.$(`[name="${name}"]`).removeClass("disabled");
    this.$(`[name="${name}"]`).html(text);
  }
  recoverBtn(name, text) {
    this.$(`[name="${name}"]`).removeClass("disabled");
    this.$(`[name="${name}"]`).html(text || this._btns[name]);
  }

  disableBtnById(id, text = "数据获取中...") {
    this._btns[id] = this.$(`#${id}`).html();
    this.$(`#${id}`).addClass("disabled");
    this.$(`#${id}`).html(text);
  }
  recoverBtnById(id, text) {
    this.$(`#${id}`).removeClass("disabled");
    this.$(`#${id}`).html(text || this._btns[id]);
  }

  /**
   * 动态配置
   * @param {*} feild 配置字段名
   * @param {*} config 配置信息
   */
  setGlobal(feild, config) {
    if (feild === "component") throw new Error("component is reserved");
    this[feild] = config;
  }

  /**
   * 设置组件
   * @param {*} feild
   * @param {*} func
   * @param {*} override 强制覆盖
   */
  setComponent(feild, func, override = false) {
    if (!override) {
      if (this.component[feild])
        throw new Error(`component ${feild} is existed`);
    }
    this.component[feild] = func;
  }

  getComponent(feild) {
    return this.component[feild];
  }
}

class GlobalToolsClass extends GlobalClass {
  constructor(configs = {}) {
    super(configs);
  }

  // Toast 消息
  insertAToast(options = {}) {
    return insertAToast(options);
  }
  fullToast(title, msg, options = {}) {
    const { background = "primary", autohide } = options;
    return this.insertAToast({
      title,
      msg,
      style: "full",
      background,
      autohide: autohide === undefined ? false : autohide,
    });
  }
  simplePrimary(title) {
    return this.insertAToast({
      title,
      style: "simple",
      color: "text-white",
      background: "primary",
    });
  }
  simpleSuccess(title) {
    return this.insertAToast({
      title,
      style: "simple",
      color: "text-white",
      background: "success",
    });
  }
  simpleWarning(title, autohide) {
    return this.insertAToast({
      title,
      style: "simple",
      color: "text-white",
      background: "warning",
    });
  }
  simpleDanger(title, autohide) {
    return this.insertAToast({
      title,
      style: "simple",
      color: "text-white",
      background: "danger",
      autohide: autohide === undefined ? false : autohide,
    });
  }
  simpleInfo(title, autohide = true) {
    return this.insertAToast({
      title,
      style: "simple",
      color: "text-black",
      background: "",
      delay: 2000,
      autohide,
    });
  }

  formatPath(str) {
    if (str && typeof str === "string") {
      str = str.replace(/\\/g, "/");
    }
    return str;
  }
  formatId(name) {
    return name
      .replace(/:/g, "_")
      .replace(/\?/g, "_")
      .replace(/=/g, "_")
      .replace(/ /g, "_")
      .replace(/-/g, "_")
      .replace(/\|/g, "_")
      .replace(/\//g, "_")
      .replace(/\\/g, "_")
      .replace(/\(/g, "_")
      .replace(/\)/g, "_")
      .replace(/\[/g, "_")
      .replace(/\]/g, "_")
      .replace(/\./g, "_");
  }

  // 日期和时间
  showDatetime(date) {
    return this.dayjs(date).format(this.DATETIME_FORMAT);
  }
  showDate(date) {
    return this.dayjs(date).format(this.DATE_FORMAT);
  }
  showDateCN(date) {
    return this.dayjs(date).format(`YYYY年MM月DD日`);
  }
  showDateDesc(date, showWeekday = false, refDate) {
    if (!refDate) refDate = new Date();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const weekday = showWeekday
      ? `(星期${weekdays[this.dayjs(date).day()]})`
      : "";
    if (this.isToday(date)) {
      return `今天${weekday}`;
    } else {
      const days = this.dayjs(date).diff(this.showDate(refDate), "day");
      if (days > 0) {
        return `${days}天后${weekday}`;
      } else {
        return `${0 - days}天前${weekday}`;
      }
    }
  }

  /**
   * 判断date是否在refDate之后
   * @param {*} date
   * @param {*} refDate 基准日期
   * @returns
   */
  dateIsAfterRefDate(date, refDate = new Date()) {
    if (this.dayjs(date).diff(refDate, "day") > 0) {
      return true;
    }
    return false;
  }

  /**
   * 判断date是否在refDate之后
   * @param {*} date
   * @param {*} refDateTime 基准日期
   * @returns
   */
  datetimeIsAfterRefDatetime(datetime, refDateTime) {
    if (this.dayjs(datetime).diff(refDateTime, "second") >= 0) {
      return true;
    }
    return false;
  }

  /**
   * 判断date是否为refDate
   * @param {*} date
   * @param {*} refDate
   * @returns
   */
  dateIsRefDate(date, refDate) {
    if (this.dayjs(date).diff(refDate, "day") === 0) {
      return true;
    }
    return false;
  }

  isPast(refDate) {
    if (this.dayjs(this.showDate()).diff(refDate, "day") < 0) {
      return true;
    }
    return false;
  }

  isToday(refDate) {
    if (this.showDate() === this.showDate(refDate)) {
      return true;
    }
    return false;
  }

  print(msg, style) {
    if (!this.enable_print) {
      return;
    }

    if (style) {
      switch (style) {
        case "info":
        case "blue":
        default:
          console.log(`%c${msg}`, "color:#2289DB; font-weight:bold;");
          break;

        case "yellow":
        case "warning":
          console.log(`%c${msg}`, "color:#f0ad4e; font-weight:bold;");
          break;

        case "green":
        case "success":
          console.log(`%c${msg}`, "color:#5cb85c; font-weight:bold;");
          break;

        case "red":
        case "danger":
          console.log(`%c${msg}`, "color:#EF0000; font-weight:bold;");
          break;
      }
    } else {
      console.log(msg);
    }
  }

  copyData(data) {
    try {
      const { clipboard } = this.electron;
      clipboard.writeText(JSON.stringify(data, null, 2));
      this.simpleSuccess("已复制数据到剪贴板！");
    } catch (err) {
      this.simpleDanger("无法获取数据", true);
    }
  }

  copyRawData(data) {
    try {
      const { clipboard } = this.electron;
      clipboard.writeText(data);
      this.simpleSuccess("已复制数据到剪贴板！");
    } catch (err) {
      this.simpleDanger("无法获取数据", true);
    }
  }

  async openExternalLink(url) {
    if (url) {
      url = url.replace(/\\/g, "/");
      url = url.replace(/\/\//g, "/");
    }
    const shell = this.electron.shell;
    shell.openExternal(url);
  }

  getExtname(filepath) {
    const path = require("path");
    return path.extname(filepath);
  }

  getFilename(filepath) {
    const path = require("path");
    return path.basename(filepath);
  }

  openFilesystemPath(path) {
    const shell = this.electron.shell;
    shell.openPath(path);
  }

  /**
   * 打开一个文件夹并选中指定文件（如有）
   * @param {*} fullpath
   */
  openFilesystemPathAndChooseFile(fullpath) {
    const shell = this.electron.shell;
    shell.showItemInFolder(fullpath);
  }

  async openNewWindow(page) {
    const result = await this.systemInst.openANewWindow({ page });
    console.log(result);
    if (result.errors) {
      this.simpleDanger(result.errors.message, true);
    }
  }

  ipcSend(channel, data) {
    this.ipcRenderer.send(channel, data);
  }

  buildCommonSendData(data) {
    return Object.assign(data, {
      // Add Static Data here ...
    });
  }

  scroll2Top() {
    this.$("html,body").animate(
      {
        scrollTop: 0,
      },
      200
    );
  }

  scrollTo(px) {
    this.$("html,body").animate(
      {
        scrollTop: px,
      },
      200
    );
  }

  gotoId(id, parentId, offset = 0) {
    const containerId = parentId ? `#${parentId}` : "html,body";
    const container = this.$(containerId) || {};
    const scrollTo = this.$(`#${id}`) || {};
    const scrollToOffset = scrollTo.offset() || {};
    const top =
      scrollToOffset.top - container.offset().top + container.scrollTop();
    container.animate({
      scrollTop: top + offset,
    });
  }

  generateSeed(length = 20) {
    return generateSeed(length);
  }

  convertJSONData(data) {
    try {
      return Function(`return ${data}`)();
    } catch (err) {
      return null;
    }
  }
  getTypeCss(type) {
    let typeName = type;
    switch (type) {
      case "Schedule":
      case "schedule":
        typeName = `<span class="badge rounded-pill bg-primary">报表Schedule</span>`;
        break;
      case "Map":
        typeName = `<span class="badge rounded-pill bg-success">Map</span>`;
        break;
      case "object":
        typeName = `<span class="badge rounded-pill bg-light text-dark">Object</span>`;
        break;
      case "number":
        typeName = `<span class="badge rounded-pill bg-dark">number</span>`;
        break;
      case "value":
        typeName = `<span class="badge rounded-pill bg-dark">数值Value</span>`;
        break;
      case "percentage":
        typeName = `<span class="badge rounded-pill bg-dark">百分比数值Percentage</span>`;
        break;
      case "number(Double)":
        typeName = `<span class="badge rounded-pill bg-dark">数值Double</span>`;
        break;
      case "string":
        typeName = `<span class="badge rounded-pill bg-info">字符串(${type})</span>`;
        break;
      case "string(date)":
        typeName = `<span class="badge rounded-pill bg-info">字符串(日期)</span>`;
        break;
      case "date":
        typeName = `<span class="badge rounded-pill bg-success">日期Date</span>`;
        break;
      case "boolean":
        typeName = `<span class="badge rounded-pill bg-danger">布尔值${type}</span>`;
        break;
      default:
        typeName = `<span class="badge rounded-pill bg-secondary">${type}</span>`;
        break;
    }
    return typeName;
  }

  getBadge(text, bg) {
    return `<span class="badge bg-${bg} rounded-pill">${text}</span>`;
  }
  getCode(text) {
    return `<code>${text}</code>`;
  }

  getRenderedObj(obj, language = "json") {
    if (!this.hljs) {
      console.log("hightlight.js is not initialized");
      return "";
    }
    const objString = JSON.stringify(obj, null, 2);
    const example =
      typeof objString === "string"
        ? this.hljs.highlight(objString, {
            language,
          }).value
        : objString;
    return `
      <div style="background: #333; color: #fff; padding-left:6px; padding-top:4px; overflow-y:auto; max-height:260px;" class="scrollbar">
        <pre><code>${example || ""}</code></pre>
      </div>
    `;
  }

  getStatusCode(url, statusCode, statusOnly) {
    let statusLabel = "";
    let urlLabel = "";
    switch (Number(statusCode)) {
      case 200:
      case 201:
      case 204:
        statusLabel = `<span class="badge bg-success">${statusCode}</span>`;
        urlLabel = `<span class="text-success">${url}</span>`;
        break;

      case 400:
      case 401:
      case 404:
      case 422:
        statusLabel = `<span class="badge bg-warning">${statusCode}</span>`;
        urlLabel = `<span class="text-warning">${url}</span>`;
        break;

      case 500:
      case 502:
        statusLabel = `<span class="badge bg-danger">${statusCode}</span>`;
        urlLabel = `<span class="text-danger">${url}</span>`;
        break;

      default:
        statusLabel = `<span class="badge bg-secondary">${statusCode}</span>`;
        urlLabel = `<span class="text-secondary">${url}</span>`;
        break;
    }
    if (statusOnly) return statusLabel;
    return `${statusLabel} ${urlLabel}`;
  }

  getSize(size) {
    if (isNaN(Number(size))) return `- KB`;
    size = parseInt(Number(size)) || 0;
    if (size <= 1024) return `${size} B`;
    if (size <= 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size <= 1024 * 1024 * 1024)
      return `${(size / 1024 / 1024).toFixed(2)} MB`;
    if (size <= 1024 * 1024 * 1024 * 1024)
      return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
    return size;
  }

  async initPage(isHome = false) {
    if (!this.systemInst) {
      console.log("systemInst lost!");
      return;
    }

    initToastContainer();

    const res = await this.systemInst.getSoftwareInfo();
    console.log("systemInst.getSoftwareInfo", res);
    if (res.errors || !res.data) {
      console.log("systemInst.getSoftwareInfo get failed!");
      return;
    }

    const info = res.data;
    const { beginYear, latestLog, isProductionMode } = info;

    // 年
    const currYear = new Date().getFullYear();
    const year =
      Number(beginYear) === Number(currYear)
        ? beginYear
        : `${beginYear} ~ ${currYear}`;

    // 版本号
    const { ver } = latestLog;

    // Title
    document.title += ` · v${ver}`;

    // 调试模式
    if (!isProductionMode) {
      this.$(".navbar").after(
        `<div class="bg-warning bg-gradient" style="position:fixed; left:0px; width:100%; top:56px; padding:4px 10px; text-align:center; z-index:100; font-size:0.9em; font-weight:600;">此版本运行于开发者模式下，如要发布请关闭该模式</div>`
      );
    }

    // Footer
    this.$("#page-footer").html(`
      ©${year} 
      <a class="hover" onclick="globals.openExternalLink('https://www.linxiaozhou.com')">
        林晓州
      </a> 
      设计、开发并提供技术支持 · v${ver}`);

    return { ...info, version: ver };
  }
}
var PUBTOOLS = new GlobalToolsClass();

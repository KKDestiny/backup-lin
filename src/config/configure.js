/*
 * @Date: 2022-08-07 10:46:24
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import { homedir } from "os";

/**
 * 生产模式
 */
const ENV_PRODUCTION = true;

/**
 * 上次发布版本号
 */
const LAST_VERSION = "0.0.0";

/**
 * Magic Code
 */
const MAGIC_CODE = ENV_PRODUCTION ? "384628" : "123456";

/**
 * 软件名称
 */
const softwareName = "ElectronTemplateJQuery";

/**
 * 打开开发者工具
 */
const ENV_DEV_TOOL = ENV_PRODUCTION ? false : true;

/**
 * 软件数据目录
 */
const rootPath = ENV_PRODUCTION
  ? `${homedir()}/Documents/${softwareName}`
  : `${homedir()}/Documents/${softwareName}_Debug`;

const iconPath = "public/images/round_red_mac.png";

export default {
  beginYear: "2022",
  fullName: "ElectronTemplateJQuery",
  description: "ElectronTemplateJQuery",
  rootPath,
  softwareName,

  ENV_PRODUCTION,
  ENV_DEV_TOOL,
  LAST_VERSION,

  MAGIC_CODE,

  fullIconPath: "public/images/logo_raw.png",
  fullIconInversePath: "public/images/logo_raw_inverse.png",
  iconPath,
  trayMacIconPath: "public/images/tray_mac.png",

  author: "林晓州",
  authorWebsite: "https://www.linxiaozhou.com",
};

export const winConfig = {
  width: 1920,
  minWidth: 880,
  height: 1080,

  // frameless
  transparent: false,
  frame: true,
  hasShadow: true,
  resizable: true,

  // 渲染过程中的背景色
  backgroundColor: "#eee",

  // 设置图标
  icon: iconPath,

  // 设置标题
  title: softwareName,

  // 允许在网页中使用node接口
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  },
};

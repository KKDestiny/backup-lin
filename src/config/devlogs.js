/*
 * @Date: 2022-07-25 22:46:24
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
const logDevLevel = {
  milestone: {
    id: "milestone",
    name: "里程碑",
    color: "#EF0000",
  },
  important: {
    id: "important",
    name: "重要更新",
    color: "#1D62F0",
  },
  normal: {
    id: "normal",
    name: "普通更新",
    color: "#898C90",
  },
  fixed: {
    id: "fixed",
    name: "Bug修复",
    color: "#FF9500",
  },
};

const logDevLogs = [
  {
    ver: "0.0.0",
    date: "2022/07/25",
    dev: "启动及初始化",
    auth: "林晓州",
    level: logDevLevel.milestone.id,
  },
  {
    ver: "1.0.0",
    date: "2022/08/09",
    dev: "提供文件备份服务器功能",
    auth: "林晓州",
    level: logDevLevel.milestone.id,
  },
];

export const getLatestLog = () => {
  return logDevLogs[logDevLogs.length - 1];
};

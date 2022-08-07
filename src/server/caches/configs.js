/*
 * @Date: 2022-03-04 22:18:54
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import { generateSeed } from "../../utils/server.util";

let httpServerConfig = {};

let authCode = generateSeed();
export function getAuthCode() {
  return authCode;
}
export function resetAuthCode() {
  authCode = generateSeed();
  return authCode;
}

export function configHttpServer(req) {
  const { operation, configs } = req;

  switch (operation) {
    case "update":
      Object.assign(httpServerConfig, configs);
      break;
    case "replace":
      httpServerConfig = configs;
      break;
    case "delete":
      httpServerConfig = {};
      break;

    default:
      return { errors: `Invalid operation: ${operation}` };
  }

  return { succeed: true, operation, configs };
}

export function getHttpServerConfigs() {
  return httpServerConfig;
}

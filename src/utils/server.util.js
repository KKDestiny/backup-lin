/*
 * @Date: 2022-03-01 12:03:45
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import os from "os";
import qrcode from "qrcode";

export function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (let devName in interfaces) {
    let iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }

  return null;
}

export async function generateQrSVG(url) {
  return new Promise(resolve => {
    qrcode.toString(url, { type: "svg" }, (err, svg) => {
      if (err) return resolve({ errors: err });
      return resolve({ data: svg });
    });
  });
}

export function generateSeed(length = 20) {
  const text = [
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "1234567890",
  ];
  const rand = function (min, max) {
    return Math.floor(Math.max(min, Math.random() * (max + 1)));
  };
  let pw = "";
  for (let i = 0; i < length; ++i) {
    const strpos = rand(0, 2);
    pw += text[strpos].charAt(rand(0, text[strpos].length));
  }
  return pw;
}

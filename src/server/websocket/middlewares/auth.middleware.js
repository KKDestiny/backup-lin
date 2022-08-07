import { getAuthCode } from "../../caches/configs";

/**
 * 身份认证中间件
 * @param {*} socket
 * @param {*} next
 * @returns
 */
function auth(socket, next) {
  const token = socket.handshake.auth.token;
  if (token !== getAuthCode()) {
    return next({ data: "auth failed" });
  }

  next();
}

export default auth;

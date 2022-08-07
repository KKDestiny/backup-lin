import { getAuthCode } from "../caches/configs";

/**
 * 身份认证中间件
 * @param {*} socket
 * @param {*} next
 * @returns
 */
async function auth(req, res, next) {
  const token = req.headers.authorization;
  if (token !== getAuthCode()) {
    return next({ data: "auth failed" });
  }

  next();
}

export default auth;

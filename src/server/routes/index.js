/*
 * @Date: 2022-03-01 08:49:06
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import express from "express";

import configure from "../../config/configure";
import { getLatestLog } from "../../config/devlogs";

import auth from "../middlewares/auth.middleware";

const router = express.Router({ mergeParams: true });

// 渲染首屏
router.get("/", async (req, res) => {
  res.render("index.ejs", {
    fullName: configure.fullName,
    author: configure.author,
    isProductionMode: configure.ENV_PRODUCTION,
  });
});

// Echo
router.get("/echo", (req, res) => {
  const { payload } = req.query;
  res.status(200).json({ data: "succeed", payload });
});

// Echo with auth
router.get("/echo-auth", auth, (req, res) => {
  const { payload } = req.query;
  res.status(200).json({ data: "succeed", payload });
});

// 内部IPC代理
router.post("/ipc-proxy", auth, async (req, res) => {
  const body = req.body;
  const { channel } = body;

  let responseData = {};
  switch (channel) {
    case "GET /system/software":
      responseData = {
        beginYear: configure.beginYear,

        fullName: configure.fullName,
        rootPath: configure.rootPath,
        author: configure.author,
        authorWebsite: configure.authorWebsite,

        isProductionMode: configure.ENV_PRODUCTION,

        latestLog: getLatestLog(),
      };
      break;

    default:
      console.log(`!![SERVER][ROUTER]POST ipc-proxy -> ${channel}`);
      break;
  }

  res.status(200).json({ data: responseData });
});

export default router;

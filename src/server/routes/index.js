/*
 * @Date: 2022-03-01 08:49:06
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import express from "express";
import fs from "fs-extra";
import path from "path";

import configure from "../../config/configure";
import { getLatestLog } from "../../config/devlogs";

import auth from "../middlewares/auth.middleware";
import uploader from "../utils/uploader.util";
import { generateSeed } from "../../utils/server.util";

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

// 上传文件
router.post(
  "/upload-file",
  auth,
  uploader.single("files"),
  async (req, res) => {
    const dir = `${configure.rootPath}/tmp`;
    if (!fs.pathExistsSync(dir)) await fs.mkdirs(dir);

    const fileInfo = req.file;
    // const ext = path.extname(fileInfo.originalname);
    const filename = `${fileInfo.originalname}`;
    const filepath = `${dir}/${filename}`;
    await fs.writeFile(filepath, fileInfo.buffer, "utf-8");
    console.log(filepath);

    res.status(200).json({
      data: {
        filename,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
      },
    });
  }
);

// 备份
router.post("/backup", auth, uploader.single("files"), async (req, res) => {
  const dirname = req.body.dirname;
  const filename = req.body.filename;
  const backuptype = req.body.backuptype;
  let rootDir = backuptype ? `` : "tmp/";
  const dir = `${configure.rootPath}/${rootDir}${dirname}`;
  if (!fs.pathExistsSync(dir)) await fs.mkdirs(dir);

  const fileInfo = req.file;
  const filepath = `${dir}/${filename}`;
  await fs.writeFile(filepath, fileInfo.buffer, "utf-8");
  console.log(filepath);

  res.status(200).json({
    data: {
      filename,
      mimetype: fileInfo.mimetype,
      size: fileInfo.size,
    },
  });
});

export default router;

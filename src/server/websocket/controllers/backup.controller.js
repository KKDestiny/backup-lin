import fs from "fs-extra";
import configure from "../../../config/configure";

async function backupList(payload, callback) {
  console.log(`[POST] /backup/list`);
  const dirname = payload.dirname;
  const dir = `${configure.rootPath}/tmp/${dirname}`;
  if (!fs.pathExistsSync(dir)) await fs.mkdirs(dir);

  const list = payload.list;
  const filepath = `${dir}/index.json`;
  console.log(`[POST] /backup/list`, filepath);
  await fs.writeFile(filepath, JSON.stringify(list, null, 2), "utf-8");

  const tobeSync = [];
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    const name = element.fileEntry.name;
    const dirname = element.dirname;
    const fullPath = `${configure.rootPath}/tmp/${dirname}/${name}`;
    if (!fs.pathExistsSync(fullPath)) {
      tobeSync.push(element);
    }
  }

  callback({ data: { total: list.length, tobeSync } });
}

/**
 * 备份图片数据
 * @param {*} payload
 * @param {*} callback
 */
async function backupPictures(payload, callback) {
  console.log(`[POST] /backup/pictures`);
  const dir = `${configure.rootPath}/pictures`;
  if (!fs.pathExistsSync(dir)) await fs.mkdirs(dir);

  const list = payload.list;
  const filepath = `${dir}/index.json`;
  console.log(`[POST] /backup/pictures`, filepath);
  await fs.writeFile(filepath, JSON.stringify(list, null, 2), "utf-8");

  const tobeSync = [];
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    const name = element.fileEntry.name;
    const dirname = element.dirname;
    const fullPath = `${configure.rootPath}/${dirname}/${name}`;
    // console.log(fs.pathExistsSync(fullPath), fullPath);
    if (!fs.pathExistsSync(fullPath)) {
      tobeSync.push(element);
    }
  }

  callback({ data: { total: list.length, tobeSync } });
}

/**
 * 备份APP数据
 * @param {*} payload
 * @param {*} callback
 */
async function backupLIN(payload, callback) {
  console.log(`[POST] /backup/lin`);
  const dir = `${configure.rootPath}/lin`;
  if (!fs.pathExistsSync(dir)) await fs.mkdirs(dir);

  const list = payload.list;
  const filepath = `${dir}/index.json`;
  console.log(`[POST] /backup/lin`, filepath);
  await fs.writeFile(filepath, JSON.stringify(list, null, 2), "utf-8");

  const tobeSync = [];
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    const name = element.fileEntry.name;
    const dirname = element.dirname;
    const fullPath = `${configure.rootPath}/${dirname}/${name}`;
    // console.log(fs.pathExistsSync(fullPath), fullPath);
    if (!fs.pathExistsSync(fullPath)) {
      tobeSync.push(element);
    } else if (dirname.includes("data/database")) {
      // 数据文件实时更新
      tobeSync.push(element);
    }
  }

  callback({ data: { total: list.length, tobeSync } });
}

export default {
  backupList,
  backupPictures,
  backupLIN,
};

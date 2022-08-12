import fs from "fs-extra";
import configure from "../../../config/configure";

async function backupList(payload, callback) {
  console.log(`[POST] /backup-list`);
  const dirname = payload.dirname;
  const dir = `${configure.rootPath}/tmp/${dirname}`;
  if (!fs.pathExistsSync(dir)) await fs.mkdirs(dir);

  const list = payload.list;
  const filepath = `${dir}/index.json`;
  console.log(`[POST] /backup-list`, filepath);
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

export default {
  backupList,
};

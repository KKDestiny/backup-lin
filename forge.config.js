/**
 * Forge配置
 * 参考文档: https://www.electronforge.io/configuration
 */
const { platform } = process;

/**
 * 软件icon
 */
const icon =
  platform === "win32"
    ? // Windows系统
      "res/icon.ico"
    : // MacOS
      "res/icon.icns";

/**
 * 传统windows安装器
 */
const makerWix = {
  name: "@electron-forge/maker-wix",
  config: {
    programFilesFolderName: "electron-jquery-app",
    language: 1033,
    appIconPath: "res/icon.ico",
    cultures: "cn",
    manufacturer: "linxiaozhou.com",
  },
};

/**
 * 推荐的Windows安装器
 */
const makerSquirrel = {
  name: "@electron-forge/maker-squirrel",
  config: {
    name: "electron-jquery-app",
    loadingGif: "res/installation.gif",
    setupIcon: "res/icon.ico",
  },
};

/**
 * 适用于MacOS或Linux的安装器
 */
const makerZip = {
  name: "@electron-forge/maker-zip",
  platforms: ["darwin"],
};
const makerDEB = {
  name: "@electron-forge/maker-deb",
  config: {},
};
const makerRPM = {
  name: "@electron-forge/maker-rpm",
  config: {},
};

const makers =
  platform === "win32"
    ? [
        // 传统windows安装器:
        // https://js.electronforge.io/maker/wix/globals
        // makerWix, // Ignore

        // 推荐的Windows安装器:
        // https://js.electronforge.io/maker/squirrel/interfaces/makersquirrelconfig
        makerSquirrel,
      ]
    : [
        // Mac及Linux安装器
        makerZip,

        makerDEB,
        makerRPM,
      ];

module.exports = {
  // 打包配置
  packagerConfig: {
    // 不打包的文件或目录
    ignore: [
      ".vscode/*",
      "src/analyzer/*",
      "src/config/*",
      "src/controllers/*",
      "src/models/*",
      "src/requests/*",
      "src/routes/*",
      "src/specs/*",
      "src/public/*",
      "src/views/*",
      "src/utils/*",
      "src/server/*",
      "src/seeders/*",
      "res/source",
      ".compilerc",
      ".eslintignore",
      ".eslintrc",
      ".eslintrc.json",
      ".gitignore",
      ".npmrc",
      "prettier.config.js",
      "build-mac-icon.sh",
      "obfuscator.config.json",
      "commitlint.config.js",
      "forge.config.js",
    ],
    // 程序图标
    icon,
  },

  // 构建配置
  makers,

  // electronRebuildConfig: {},
  // publishers: [],
  // plugins: [],
  // hooks: {},
  // buildIdentifier: "my-build",
};

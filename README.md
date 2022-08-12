# Biref Introduction

孤岛笔记的数据备份客户端，支持导出手机指定目录的全部文件，支持导出孤岛笔记的 app 数据到客户端

# Installation

```shell
yarn
```

# F&A

## socket.emit() 时出现 transport close 错误

socket.io 启动 server 时，如果没有设置允许上传的文件最大 size（配置项为 maxHttpBufferSize）默认最大为 1MB，如果数据超出此限制，客户端会报错: `transport close`，并导致同时本次通信失败，继而自动重连

# 制作苹果图标

将 png 图片放在 `./res/source/` 下，并命名为 `logo.png` 后，在根目录下执行下面命令：

```shell
. build-mac-icon.sh
```

执行成功后，会自动生成苹果系统支持的 `icns` 文件并替换原来的 `icon.icns` 文件。如果需要修改源文件路径或输出文件路径，可修改根目录下的 `build-mac-icon.sh` 文件。

# 打包及构建配置

Electron Forge 支持两种方式的配置：

- 通过 `package.json` 配置（推荐）
- 通过 js 文件配置

## 使用 package.json 进行配置

其中，`package.json` 的配置方式：

```json
{
  "config": {
    "forge": {
      "packagerConfig": {
        "ignore": [
          "res/source/*",
          "src/config/*",
          "src/controllers/*",
          "src/models/*",
          "src/requests/*",
          "src/routes/*",
          "src/utils/*",
          ".compilerc",
          ".eslintignore",
          ".eslintrc",
          ".eslintrc.json",
          ".gitignore",
          ".npmrc",
          "prettier.config.js",
          "build-mac-icon.sh",
          "obfuscator.config.json",
          "commitlint.config.js"
        ],
        "icon": "res/icon.ico"
      },
      "makers": [
        {
          "name": "@electron-forge/maker-wix",
          "config": {
            "programFilesFolderName": "electron-jquery-app",
            "language": 1033,
            "appIconPath": "res/icon.ico",
            "cultures": "cn",
            "manufacturer": "Linxiaozhou.com"
          }
        },
        {
          "name": "@electron-forge/maker-squirrel",
          "config": {
            "name": "electron-jquery-app"
          }
        },
        {
          "name": "@electron-forge/maker-zip",
          "platforms": ["darwin"]
        },
        {
          "name": "@electron-forge/maker-deb",
          "config": {}
        },
        {
          "name": "@electron-forge/maker-rpm",
          "config": {}
        }
      ]
    }
  }
}
```

## 使用 js 文件进行配置

首先，需要在 `package.json` 中声明使用哪个 js 文件：

```json
{
  "config": {
    "forge": "./forge.config.js"
  }
}
```

然后在 `forge.config.js` 文件中描述配置信息：

```js
module.exports = {
  // 打包配置
  packagerConfig: {},

  // 构建配置
  makers: [],

  electronRebuildConfig: {},
  publishers: [],
  plugins: [],
  hooks: {},
  buildIdentifier: "my-build",
```

# Package & Make

## Package

执行 `yarn package` 后，在 `out` 目录下会生成打包的目录，里面有可执行文件，可用于调试或临时发布

[配置文档](https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html)

## Make MacOS 的 app

在调试完成后，需要发布正式版本，就需要 make 出一个安装包了。相关参数在 `makers` 字段中配置。

## Make Windows 安装器 Squirrel.Windows

官方推荐的 make 方式

- [官方文档](https://www.electronforge.io/config/makers/squirrel.windows)
- [配置文档](https://js.electronforge.io/maker/squirrel/interfaces/makersquirrelconfig)

## make Windows 安装器 MSI

传统的安装器，安装过程和普通软件类似。

- [官方文档](https://www.electronforge.io/config/makers/wix-msi)
- [配置文档](https://js.electronforge.io/maker/wix/interfaces/makerwixconfig)
- [electron-wix-msi](https://github.com/felixrieseberg/electron-wix-msi#should-i-use-this)

### 步骤

1. 在电脑中安装 WiX Toolset

[WiX Toolset](https://wixtoolset.org/releases/)

2. 在工程中添加一个 package

```shell
yarn add @electron-forge/maker-wix --dev
```

### Q&A

#### 建议

make 过程中，你可能会调整不同的 make 参数，结果之前可以成功的参数，突然就不行了。这种情况一般是 `out` 目录里有残留上一次（或更早）的其他配置下 make 的数据。
如果你想避免这类问题，或遇到后不知道怎么解决，也许把 `out` 目录删除会是一个最快的选择。

#### WiX Toolset 环境变量

如果在 make 过程中遇到以下错误：

```
An unhandled error has occurred inside Forge:
An error occured while making for target: wix
Could not find light.exe or candle.exe
Error: Could not find light.exe or candle.exe
```

说明没有正确安装 WiX Toolset 或未添加环境变量，需手动添加 WiX Toolset 的环境变量：

```shell
C:\Program Files (x86)\WiX Toolset {{version}}\bin
```

其中，`{{version}}` 为你安装的 WiX Toolset 的版本号，例如：

```shell
C:\Program Files (x86)\WiX Toolset v3.11\bin
```

添加到当前用户的环境变量中即可，不需要添加到系统环境变量；添加成功后，需要注销当前用户的登录状态（不需要重启电脑），然后重新登录当前用户即可。

详情可参照以下链接：
https://github.com/felixrieseberg/electron-wix-msi/issues/25

#### 字符集错误

如果在 make 过程中遇到下面错误，则说明你在文件夹、文件名中使用了无法识别的字符集（主要是中文）

```shell
error LGHT0311 : A string was provided with characters that are not available in the specified database code page '1252'. Either change these characters to ones that exist in the database's code page, or update the database's code page by modifying one of the following attributes: Product/@Codepage, Module/@Codepage, Patch/@Codepage, PatchCreation/@Codepage, or WixLocalization/@Codepage.
```

终极解决方法是尽量避免在文件或文件夹中使用中文名或其他非 ASIIC 码的字符。但如果木已成舟，目前还没有找到很好的解决方法，只能自己去检查哪里有用到中文字符了，或者去蹲这个 [issue#52](https://github.com/felixrieseberg/electron-wix-msi/issues/52)。

# References

- [Rlectron Forge](https://www.electronforge.io/): https://www.electronforge.io
- [Packager Configs](https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html): https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html
- [@electron-forge/maker-squirrel](https://js.electronforge.io/maker/squirrel/interfaces/makersquirrelconfig): https://js.electronforge.io/maker/squirrel/interfaces/makersquirrelconfig
- [windows MSI](https://github.com/felixrieseberg/electron-wix-msi#should-i-use-this): https://github.com/felixrieseberg/electron-wix-msi#should-i-use-this

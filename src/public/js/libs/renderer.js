/* eslint-disable no-undef */
/*
 * @Date: 2022-01-15 23:54:17
 * @LastEditors: linxiaozhou.com
 * @Description: This is a high-performance renderer
 */
const __RENDERER_generateSeed = (length = 20) => {
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
};
const __RENDERER_getValueByPath = (src = {}, path = "", strict) => {
  const source = src === null ? {} : src;
  const keys = path.split(".");
  let result = source;
  for (const key of keys) {
    if (result[key] === undefined) {
      return strict ? undefined : {};
    }
    result = result[key];
  }
  return result;
};
const __RENDERER_formatId = name => {
  return name
    .replace(/:/g, "_")
    .replace(/\?/g, "_")
    .replace(/=/g, "_")
    .replace(/ /g, "_")
    .replace(/-/g, "_")
    .replace(/\|/g, "_")
    .replace(/\//g, "_")
    .replace(/\\/g, "_")
    .replace(/\(/g, "_")
    .replace(/\)/g, "_")
    .replace(/\[/g, "_")
    .replace(/\]/g, "_")
    .replace(/\./g, "_");
};
const __RENDERER_copyData = data => {
  try {
    if (!electron) return data;
    const { clipboard } = electron;
    clipboard.writeText(JSON.stringify(data, null, 2));
  } catch (err) {
    console.log(err);
  }
};

class JSONRendererClass {
  constructor(options = {}) {
    // Instance Name
    this.rendererName = options.rendererName || "____RENDERER_INSTANCE____";

    // 工具箱配置
    this.toolbox = options.toolbox === undefined ? true : options.toolbox;
    if (options.toolboxOpts) {
      this.toolbox = true;
    }
    const {
      copy = true,
      lightTheme = true,
      nightTheme = true,
    } = options.toolboxOpts || {};
    this.toolboxOpts = {
      copy: copy,
      lightTheme: lightTheme,
      nightTheme: nightTheme,
    };

    // 支持的主题
    this.supportedThemes = ["night", "light"];
    this.defaultTheme = options.defaultTheme || "night"; // Default Theme
    this.themes = {}; // Map: [id]:Theme

    // jQuery Like Injection
    this.$ = selector => {
      const enablePrint = false;
      const log = (...msg) => {
        if (!enablePrint) return;
        console.log(msg);
      };
      const _getUpdateClasslist = (elem, classNames, delList) => {
        const classList = elem.classList;
        const addList = classNames.split(" ");
        const currList = classList.value?.split(" ");
        const mergedObj = addList.concat(currList).reduce((temp, item) => {
          Object.assign(temp, { [item]: true });
          return temp;
        }, {});
        return Object.keys(mergedObj || {}).reduce((temp, item) => {
          if (delList.includes(item)) return temp;
          return temp + ` ${item}`;
        }, "");
      };
      return {
        // Only id selector supported
        html: html => {
          if (!selector || typeof selector !== "string") return;
          const id = selector.replace("#", "");
          log(id, html, "html");
          if (html === undefined) return document.getElementById(id).innerHTML;
          document.getElementById(id).innerHTML = html;
        },
        // Only id selector supported
        addClass: (classNames, removedNames = []) => {
          if (!selector || typeof selector !== "string") return;
          if (!classNames || typeof classNames !== "string") return;
          const id = selector.replace("#", "");
          log(id, classNames, "addClass");
          const elem = document.getElementById(id);
          const newClassList = _getUpdateClasslist(
            elem,
            classNames,
            removedNames
          );
          elem.setAttribute("class", newClassList);
        },
        // $(nameString).addClassByName(classlist)
        addClassByName: (classNames, removedNames = "") => {
          if (!selector || typeof selector !== "string") return;
          log(selector, classNames, "addClassByName");
          document.getElementsByName(selector).forEach(elem => {
            const newClassList = _getUpdateClasslist(
              elem,
              classNames,
              removedNames
            );
            elem.setAttribute("class", newClassList);
          });
        },
        // Only id selector supported
        toggle: () => {
          if (!selector || typeof selector !== "string") return;
          const id = selector.replace("#", "");
          log(id, "toggle");
          const curr = document.getElementById(id).style.display;
          const nextStatus = curr === "none" ? "" : "none";
          document.getElementById(id).style.display = nextStatus;
        },
        // Only id selector supported
        show: () => {
          if (!selector || typeof selector !== "string") return;
          const id = selector.replace("#", "");
          log(id, "show");
          document.getElementById(id).style.display = "";
        },
        // Only id selector supported
        hide: () => {
          if (!selector || typeof selector !== "string") return;
          const id = selector.replace("#", "");
          log(id, "hide");
          document.getElementById(id).style.display = "none";
        },
        // Only id selector supported
        attr: (field, style) => {
          if (!selector || typeof selector !== "string") return;
          const id = selector.replace("#", "");
          log(id, "attr");
          document.getElementById(id).style[field] = style;
        },
      };
    };

    // Datas
    this.datas = {}; // Map: [id]:data
    this.refDatas = {}; // Map: [id]:data
    this.panelIds = {}; // Map: [id]:panelId

    // Methods
    this.genSeeder = options.generateSeed || __RENDERER_generateSeed; // Generate Seeder
    this.getValueByPath = options.getValueByPath || __RENDERER_getValueByPath; // Get value by path
    this.formatId = options.formatId || __RENDERER_formatId; // Format an id to url
    this.copyData = options.copyData || __RENDERER_copyData; // Copy data to clipboard
    this.simpleSuccess = options.simpleSuccess || console.log; // 显示成功的消息
    this.simpleDanger = options.simpleDanger || alert; // 显示失败的消息

    // Styles
    this.quotes = options.quotes; // 是否使用引号包裹字段名
    this.arrowRight =
      options.arrowRight || `<i class="fa fa-caret-right"></i> `; // Right arrow icon
    this.arrowDown = options.arrowDown || `<i class="fa fa-caret-down"></i> `; // Down arrow icon
    this.marginLeft = options.marginLeft || 30; // Left margin
    this.marginLeft = options.marginLeft || 30; // Left margin
    this.renderEntryName = options.renderEntryName || "render-entry"; // all elements that be rendered will be marked as this name after id
  }

  /**
   * Save data to be rendered and return id
   * @param {*} data
   * @returns
   */
  _saveData(data, refDatas) {
    const id = this.genSeeder();
    Object.assign(this.datas, { [id]: data });

    // key全部转为小写
    const refDatasConverted = Object.entries(refDatas || {}).reduce(
      (temp, [field, data]) => {
        Object.assign(temp, { [field.toLowerCase()]: data });
        return temp;
      },
      {}
    );
    Object.assign(this.refDatas, { [id]: refDatasConverted });
    return id;
  }

  /**
   * Get data by id
   * @param {*} id
   * @returns
   */
  getData(id) {
    return this.datas[id];
  }

  /**
   * Get ref data by id
   * @param {*} id
   * @returns
   */
  getRefData(id, _refName) {
    const refName = typeof _refName === "string" ? _refName.toLowerCase() : "";
    const datas = this.refDatas[id];
    return datas[refName];
  }

  /**
   * Parse in data's path
   * @param {*} id
   * @param {*} path
   * @param {*} parentField
   * @returns
   */
  _parseByPath(id, path, parentField) {
    const data = this.datas[id];
    if (data === undefined) return undefined;

    if (!path || path === "") {
      return this._renderData(data, id, path, parentField);
    }
    const temp = this.getValueByPath(data, path);
    return this._renderData(temp, id, path, parentField);
  }

  /**
   * Get type of data
   * @param {*} data
   * @returns
   */
  _getDataType(data) {
    if (data === undefined) {
      return "undefined";
    }
    if (data === null) {
      return "null";
    }
    if (data instanceof Array) {
      return "array";
    }
    if (typeof data === "number" || data instanceof Number) {
      return "number";
    }
    if (typeof data === "string" || data instanceof String) {
      return "string";
    }
    if (typeof data === "boolean" || data instanceof Boolean) {
      return "boolean";
    }
    if (typeof data === "function") {
      return "function";
    }
    return "object";
  }

  /**
   * Preview data by data type
   * @param {*} dataType
   * @param {*} info
   * @returns
   */
  _previewData(dataType, info) {
    if (dataType === "object") {
      return `${Object.keys(info).length} fields`;
      // return Object.keys(info);
    }
    if (dataType === "array") {
      return `${info.length} items`;
    }
    return "展开";
  }

  /**
   * Get son or element
   * @param {*} data
   * @param {*} id
   * @param {*} path
   * @param {*} info
   * @param {*} index
   * @param {*} field
   * @returns
   */
  _getSonOrElem(data, id, path, info, index, field) {
    const divider = index !== Object.entries(data).length ? ", " : "";
    const elemPath = this._appendPath(path, field);
    const elemType = this._getDataType(info);
    const cssId = this.formatId(`${id}-${elemPath}`);

    const currTheme = this.themes[id];
    const clickFunc =
      elemType === "object" || elemType === "array"
        ? ` onclick="${this.rendererName}.renderSons('${id}', '${elemPath}')" `
        : "";

    const elem =
      elemType === "object" || elemType === "array"
        ? `
            <span id="${cssId}-preview" 
            name="${id}-${this.renderEntryName}" 
            class="render-hover-icon ${currTheme}" style="font-size:0.85em;" ${clickFunc}>
              ${this._previewData(elemType, info)}
            </span>
            <span id="${cssId}-content" data-status="none"></span>
          `
        : this._renderData(info, id, elemPath, field);

    const arrow =
      elemType === "object" || elemType === "array"
        ? `
            <span 
              id="${cssId}-arrow" 
              class="render-hover-icon ${currTheme}" 
              title="${elemPath}" 
              name="${id}-${this.renderEntryName}"
              ${clickFunc}
            >${this.arrowRight}</span>`
        : "";
    let content = ``;
    if (elemType === "object") {
      content = `{ ${elem} }${divider}`;
    } else if (elemType === "array") {
      content = `[ ${elem} ]${divider}`;
    } else {
      content = `${elem}${divider}`;
    }
    return {
      clickFunc,
      arrow,
      content,
    };
  }

  _appendPath(path, parentField) {
    if (path === "" && parentField !== "") return `${parentField}`;
    if (path !== "" && parentField !== "") return `${path}.${parentField}`;
    if (path !== "" && parentField === "") return "";
  }

  _getDataTypeStyle(dataType, data, currTheme) {
    let style = "";
    let content = data;
    switch (dataType) {
      case "string":
        style = `render-string ${currTheme}`;
        content = `"${data}"`;
        break;
      case "number":
        style = `render-number ${currTheme}`;
        break;
      case "boolean":
        style = `render-boolean ${currTheme}`;
        break;
    }
    return { style, content };
  }

  _renderData(data, id, path) {
    let html = "";
    const dataType = this._getDataType(data);
    const currTheme = this.themes[id];
    switch (dataType) {
      case "object":
        html += Object.entries(data).reduce((temp, [field, info], index) => {
          const currPath = this._appendPath(path, field);
          const { clickFunc, arrow, content } = this._getSonOrElem(
            data,
            id,
            path,
            info,
            index,
            field
          );
          let fieldInfo = field;
          if (this.quotes) {
            fieldInfo = `"${field}"`;
          }
          temp += `
            <div style="margin-left:${this.marginLeft}px;" title="${currPath}">
              ${arrow}<span ${clickFunc} name="${id}-${this.renderEntryName}" class="render-hover-text ${currTheme}">${fieldInfo}</span>: ${content}
            </div>`;
          return temp;
        }, "");
        break;

      case "array":
        html += data.reduce((temp, info, index) => {
          const currPath = this._appendPath(path, index);
          const { arrow, content } = this._getSonOrElem(
            data,
            id,
            path,
            info,
            index,
            index
          );
          temp += `<div style="margin-left:${this.marginLeft}px;" title="${currPath}">${arrow}${content}</div>`;
          return temp;
        }, "");
        break;

      case "string":
      case "number":
      case "boolean":
        {
          const { style, content } = this._getDataTypeStyle(
            dataType,
            data,
            currTheme
          );
          html += `
          <span class="hover-text ${style}" name="${id}-${this.renderEntryName}" onclick="${this.rendererName}.getInfo('${id}', '${path}')">
            ${content}
          </span>`;
        }
        break;

      default:
        html += `<span class="hover-text" onclick="${this.rendererName}.getInfo('${id}', '${path}')">${data}</span>`;
        break;
    }

    return html;
  }

  copyRawData(id) {
    const data = this.getData(id);
    if (this.copyData && typeof this.copyData === "function") {
      this.copyData(data);
      this.simpleSuccess(`已拷贝到剪贴板`);
    }
  }

  getInfo(id, path) {
    const data = this.getData(id);

    let res = null;
    if (window.event.ctrlKey || window.event.metaKey) {
      res = path;
    } else {
      res = this.getValueByPath(data, path);
    }

    if (this.copyData && typeof this.copyData === "function") {
      this.copyData(res);
    }
    // this.simpleSuccess(`该路径的数据已拷贝到剪贴板:<br>${path}`);
  }

  renderSons(id, dataPath) {
    if (window.event.ctrlKey || window.event.metaKey) {
      if (this.copyData && typeof this.copyData === "function") {
        const data = this.getData(id);
        const info = this.getValueByPath(data, dataPath);
        this.copyData(info);
        this.simpleSuccess(`该路径下数据已拷贝到剪贴板:<br>${dataPath}`);
      }
      return;
    }

    const cssId = this.formatId(`${id}-${dataPath}`);
    const text = this.$(`#${cssId}-arrow`).html();
    if (text === this.arrowDown)
      this.$(`#${cssId}-arrow`).html(this.arrowRight);
    else this.$(`#${cssId}-arrow`).html(this.arrowDown);

    if (this.$(`#${cssId}-content`).html() !== "") {
      this.$(`#${cssId}-content`).toggle();
      this.$(`#${cssId}-preview`).toggle();
      return;
    }

    const data = this.getData(id);
    const info = this.getValueByPath(data, dataPath);
    const html = this._renderData(info, id, dataPath);
    this.$(`#${cssId}-content`).html(html);
    this.$(`#${cssId}-content`).attr("data-status", "expanded");
    this.$(`#${cssId}-preview`).hide();
    this.$(`${id}-${this.renderEntryName}`).addClassByName(this.themes[id]);
  }

  /**
   * Change panel's theme by data's id
   * @param {*} id
   * @param {*} theme
   */
  changeTheme(id, theme = "") {
    const panelId = this.panelIds[id];
    this.themes[id] = theme;
    const delThemes = this.supportedThemes.reduce((temp, item) => {
      if (item !== theme) temp.push(item);
      return temp;
    }, []);
    this.$(`#${panelId}`).addClass(theme, delThemes);
    this.$(`${id}-${this.renderEntryName}`).addClassByName(theme, delThemes);
  }

  renderJson(data, panelId, returnHTMLOnly, refDatas = {}) {
    if (!panelId) {
      panelId = this.genSeeder();
      returnHTMLOnly = true;
    }

    if (!data) {
      const noValidDataInfo =
        "<span style='font-size:0.9em; color:#888; font-style:italic;'>无效数据</span>";
      if (returnHTMLOnly) {
        return `<div>${noValidDataInfo}</div>`;
      }
      this.$(`#${panelId}`).html(noValidDataInfo);
    }

    const id = this._saveData(data, refDatas);
    Object.assign(this.panelIds, { [id]: panelId });
    this.themes[id] = this.defaultTheme;

    const rendered = this._parseByPath(id, "", "");
    const type = this._getDataType(data);
    let fullRendered = "";
    switch (type) {
      case "array":
        fullRendered = `
        <div>[</div>
          ${rendered}
          <div>]</div>
          `;
        break;

      case "object":
      case "object-plain":
        fullRendered = `
          <div>{</div>
            ${rendered}
            <div>}</div>
            `;
        break;

      default:
        fullRendered = rendered;
        break;
    }

    const compensation = this.toolbox ? `margin-top:-20px;` : "";
    const toolboxOpts = this.toolboxOpts || {};
    const copyBtn = toolboxOpts.copy
      ? `<div onclick="${this.rendererName}.copyRawData('${id}')" class="render-toolbox-item" name="${id}-${this.renderEntryName}" title="拷贝到剪贴板"><i class="fa-solid fa-copy"></i></div>`
      : "";
    const lightThemeBtn = toolboxOpts.lightTheme
      ? `<div onclick="${this.rendererName}.changeTheme('${id}', 'light')" class="render-toolbox-item" name="${id}-${this.renderEntryName}" title="日间模式"><i class="fa-solid fa-sun"></i></div>`
      : "";
    const nightThemeBtn = toolboxOpts.nightTheme
      ? `<div onclick="${this.rendererName}.changeTheme('${id}', 'night')" class="render-toolbox-item" name="${id}-${this.renderEntryName}" title="夜间模式"><i class="fa-solid fa-moon"></i></div>`
      : "";
    const toolbox = this.toolbox
      ? `
      <div class="render-toolbox">
        ${copyBtn}
        ${lightThemeBtn}
        ${nightThemeBtn}
      </div> 
    `
      : "";
    fullRendered =
      toolbox + `<div style="${compensation}">${fullRendered}</div>`;
    if (returnHTMLOnly) {
      return `<div class="render-background ${this.defaultTheme}" id="${panelId}" style="overflow-x:auto; max-width:2000px; overflow-y:auto; height:auto;">${fullRendered}</div>`;
    }

    this.$(`#${panelId}`).html(fullRendered);
    this.$(`#${panelId}`).addClass(
      `render-background ${this.defaultTheme} scrollbar`
    );
    this.changeTheme(id, this.defaultTheme);
    this.$(`#${panelId}`).attr("overflow-x", "auto");
    this.$(`#${panelId}`).attr("max-width", "2000px");
    this.$(`#${panelId}`).attr("overflow-y", "auto");
    this.$(`#${panelId}`).attr("height", "auto");
    return id;
  }
}

class SwaggerRendererClass extends JSONRendererClass {
  constructor(options) {
    super(options);

    this.reservedFields = [
      "description", // Swagger中表示字段说明
      "type", // Swagger中表示字段类型
      "properties", // Swagger中表示某个字段的属性列表
      "additionalProperties", // Swagger中表示某个字段的Map结构
      "format", // Swagger中表示某个字段类型的格式，如type为string类型，其format可以是datetime, MongoId等
    ];

    this.ignoreFields = [
      "default", // 不需要解析
    ];
  }

  _appendPath(path, parentField, elemType, info) {
    let prefixPath = "";
    if (elemType === "object") {
      prefixPath = ".properties";
    } else if (elemType === "map") {
      prefixPath = ".additionalProperties";
      if (this._getDataType(info.additionalProperties) === "object") {
        // 如果MAP结构下面仍是对象、需要继续解析，则要把properties加入path中
        prefixPath = ".additionalProperties.properties";
      }
    }
    if (path === "" && parentField !== "") return `${parentField}${prefixPath}`;
    if (path !== "" && parentField !== "")
      return `${path}.${parentField}${prefixPath}`;
    if (path !== "" && parentField === "") return "";
  }

  /**
   * Parse in data's path
   * @param {*} id
   * @param {*} path
   * @param {*} parentField
   * @returns
   */
  _parseByPath(id, path, parentField) {
    const data = this.datas[id];
    if (data === undefined) return undefined;

    if (!path || path === "") {
      const { html } = this._renderData(data, id, path, parentField);
      return html;
    }
    const temp = this.getValueByPath(data, path);
    const { html } = this._renderData(temp, id, path, parentField);
    return html;
  }

  /**
   * Get type of data
   * @param {*} data
   * @returns
   */
  _getDataType(data, field) {
    if (this.ignoreFields.includes(field)) return "undefined";
    if (data === undefined) return "undefined";

    if (data === null) {
      return "null";
    }
    if (!typeof data.type === "string" && !(data.type instanceof String)) {
      return "undefined";
    }
    if (data.$ref) {
      return "object";
    }

    if (data.type === undefined) {
      return "object-plain";
    }
    if (!data.type.toLowerCase) return "unknown";

    if (data.type.toLowerCase() === "array") {
      return "array";
    }
    if (data.type.toLowerCase() === "number") {
      return "number";
    }
    if (data.type.toLowerCase() === "string") {
      return "string";
    }
    if (data.type.toLowerCase() === "boolean") {
      return "boolean";
    }
    if (data.type.toLowerCase() === "object" && data.additionalProperties) {
      return "map";
    }
    if (data.type.toLowerCase() === "mixed") {
      return "mixed";
    }

    if (data.format && data.format?.toLowerCase() === "schedule") {
      return "Schedule";
    }
    return "object";
  }

  _isScheduleType(data = {}) {
    if (data === null) return false;
    if (
      typeof data.format === "string" &&
      data.format.toLowerCase() === "schedule"
    )
      return true;
    return false;
  }

  _getRefName($ref) {
    if ($ref) {
      return $ref.replace("#/definitions/", "");
    }
    return $ref;
  }

  /**
   * Preview data by data type
   * @param {*} dataType
   * @param {*} info
   * @returns
   */
  _previewData(dataType, info) {
    if (dataType === "object-plain") {
      const fields = Object.keys(info).reduce((temp, key) => {
        if (!this.reservedFields.includes(key)) temp += 1;
        return temp;
      }, 0);
      return `${fields} fields`;
      // return Object.keys(info);
    }
    if (info.$ref) {
      return info.$ref;
    }
    if (dataType === "object") {
      if (this._isScheduleType(info)) {
        return `Schedule`;
      }
      if (info.$ref) {
        return info.$ref;
      }
      const fields = Object.keys(info.properties || {}).reduce((temp, key) => {
        if (!this.reservedFields.includes(key)) temp += 1;
        return temp;
      }, 0);
      return `${fields} fields`;
    }
    if (dataType === "map") {
      return `${this._getDataType(info.additionalProperties)}`;
    }
    if (dataType === "array") {
      return `${this._getDataType(info.items)}`;
    }
    return "展开";
  }

  _renderDescription(data) {
    const { description } = data || {};
    if (description === undefined) return "";
    return `<span class="render-comments">${description}</span>`;
  }

  _renderExample(data) {
    const { example } = data || {};
    if (example === undefined) return "";
    return `<span class="render-example">Example: ${JSON.stringify(
      example
    )}</span>`;
  }

  _getDataFormat(data, currTheme) {
    const { format } = data;
    if (!format) return "";

    return ` <span class="render-format ${currTheme}">($${format})</span>`;
  }

  _getDataTypeStyle(dataType, data, currTheme) {
    let style = "";
    const formatCss = this._getDataFormat(data, currTheme);
    const content = `${dataType}${formatCss}`;
    switch (dataType) {
      case "string":
        style = `render-string ${currTheme}`;
        break;
      case "number":
        style = `render-number ${currTheme}`;
        break;
      case "boolean":
        style = `render-boolean ${currTheme}`;
        break;
    }
    return { style, content };
  }

  _renderData(data, id, path) {
    let html = "";
    const dataType = this._getDataType(data);
    const descriptionInfo = this._renderDescription(data);
    const exampleInfo = this._renderExample(data);
    const currTheme = this.themes[id];
    switch (dataType) {
      case "object":
      case "object-plain":
        {
          const raw =
            dataType === "object-plain" ? data : data.properties || {};
          const line = Object.entries(raw || {}).reduce(
            (temp, [field, info], index) => {
              if (this.reservedFields.includes(field)) return temp;
              const currPath = this._appendPath(path, field);
              let clickFunc = "";
              let arrow = "";
              let content = "";
              if (
                Object.entries(info || {}).length === 1 &&
                this.ignoreFields.includes(Object.keys(info || {})[0])
              ) {
                clickFunc = "";
                arrow = "";
                content =
                  "<td><span class='render-comments'>未定义数据类型</span></td>";
              } else {
                const _temp = this._getSonOrElem(
                  data,
                  id,
                  path,
                  info,
                  index,
                  field
                );
                clickFunc = _temp.clickFunc;
                arrow = _temp.arrow;
                content = _temp.content;
              }
              let fieldInfo = field;
              if (this.quotes) {
                fieldInfo = `"${field}"`;
              }
              temp += `
                <tr style="margin-left:${this.marginLeft}px; vertical-align:top" title="${currPath}">
                  <td>${arrow}</td>
                  <td style="padding-right:10px;">
                    <span 
                      ${clickFunc} 
                      name="${id}-${this.renderEntryName}" 
                      class="render-hover-text ${currTheme}"
                    >
                      ${fieldInfo}
                    </span>
                  </td>
                  ${content}
                </tr>`;
              return temp;
            },
            ""
          );
          html += `<table style="margin-left:${this.marginLeft}px;" >${line}</table>`;
        }
        break;

      case "array":
        {
          // console.log(dataType, data);
          const currPath = this._appendPath(path, "items");
          const { arrow, content } = this._getSonOrElem(
            data,
            id,
            path,
            data.items,
            0,
            "items"
          );
          html += `<div style="margin-left:${this.marginLeft}px;" title="${currPath}">${arrow}${content}</div>`;
        }
        break;

      case "string":
      case "number":
      case "boolean":
        {
          // console.log(dataType, data);
          const { style, content } = this._getDataTypeStyle(
            dataType,
            data,
            currTheme
          );
          html += `
          <span class="hover-text ${style}" name="${id}-${this.renderEntryName}" onclick="${this.rendererName}.getInfo('${id}', '${path}')">
            ${content}
          </span>
          <div>${descriptionInfo}</div>
          <div>${exampleInfo}</div>
          `;
        }
        break;
      case "Schedule":
        {
          const { style } = this._getDataTypeStyle(dataType, data, currTheme);
          html += `
            <span class="hover-text ${style}" name="${id}-${this.renderEntryName}" onclick="${this.rendererName}.getInfo('${id}', '${path}')">
              Schedule
            </span>
            <div>${descriptionInfo}</div>
            <div>${exampleInfo}</div>
            `;
        }
        break;

      case "mixed":
        {
          const { style } = this._getDataTypeStyle(dataType, data, currTheme);
          html += `
            <span class="hover-text ${style}" name="${id}-${this.renderEntryName}" onclick="${this.rendererName}.getInfo('${id}', '${path}')">
              Mixed
            </span>
            <div>${descriptionInfo}</div>
            <div>${exampleInfo}</div>`;
        }
        break;

      default:
        html += `<span class="hover-text" onclick="${this.rendererName}.getInfo('${id}', '${path}')">${data}</span>`;
        break;
    }

    return { html, descriptionInfo, exampleInfo };
  }

  /**
   * Get son or element
   * @param {*} data
   * @param {*} id
   * @param {*} path
   * @param {*} info
   * @param {*} index
   * @param {*} field
   * @returns
   */
  _getSonOrElem(data, id, path, info, index, field) {
    if (typeof data !== "object") {
      // console.log(path, field, data);
      // TODO: $ref: #/definitions/xxx
      return {};
    }
    const currTheme = this.themes[id];
    const divider = index !== Object.entries(data).length ? ", " : "";
    const elemType = this._getDataType(info, field);
    const elemPath = this._appendPath(path, field, elemType, info);
    const cssId = this.formatId(`${id}-${elemPath}`);

    let clickFunc = ` onclick="${this.rendererName}.renderSons('${id}', '${elemPath}')" `;
    if (this._isScheduleType(info)) {
      clickFunc = "";
    }
    if (info && info.$ref) {
      const ref = this._getRefName(info.$ref);
      clickFunc = ` onclick="${this.rendererName}.renderRef('${id}', '${elemPath}', '${ref}')" `;
    }

    let elem = "";
    let description = "";
    let example = "";
    if (elemType === "object" || elemType === "array") {
      description = this._renderDescription(info);
      example = this._renderExample(info);
      elem = `
            <span id="${cssId}-preview" 
              name="${id}-${this.renderEntryName}" 
              class="render-hover-icon ${currTheme}" style="font-size:0.85em;" ${clickFunc}>
              ${this._previewData(elemType, info)}
            </span>
            <span id="${cssId}-content"></span>
          `;
    } else if (elemType === "map") {
      description = this._renderDescription(info);
      example = this._renderExample(info);
      const styles = `name="${id}-${this.renderEntryName}" 
        class="render-hover-icon ${currTheme}" style="font-size:0.85em;" ${clickFunc}`;
      elem = `
            <td>
              {
                <span ${styles}><*>: </span>
                <span id="${cssId}-preview" ${styles}>
                  ${this._previewData(elemType, info)}
                </span>
            </td>
            <td>
              <span id="${cssId}-content"></span>
              }${divider}<span style="padding-left: 6px;">${description} ${example}</span>
            </td>
          `;
    } else {
      clickFunc = "";
      const { html, descriptionInfo, exampleInfo } = this._renderData(
        info,
        id,
        elemPath,
        field
      );
      elem = html;
      description = descriptionInfo;
      example = exampleInfo;
    }

    const arrow =
      elemType === "object" || elemType === "array" || elemType === "map"
        ? `
            <span 
              id="${cssId}-arrow" 
              class="render-hover-icon ${currTheme}" 
              title="${elemPath}" 
              name="${id}-${this.renderEntryName}"
              ${clickFunc}
            >${this.arrowRight}</span>`
        : "";
    let content = ``;
    if (elemType === "object") {
      content = `<td>{ ${elem} }${divider}</td> <td style="padding-left: 6px;">${description} ${example}</td>`;
    } else if (elemType === "map") {
      content = `${elem}`;
    } else if (elemType === "array") {
      content = `<td>[ ${elem} ]${divider}</td> <td style="padding-left: 6px;">${description} ${example}</td>`;
    } else {
      content = `<td>${elem}</td> <td></td>`;
    }
    return {
      clickFunc,
      arrow,
      content,
      description,
      example,
    };
  }

  /**
   * 渲染引用的数据Swagger
   * @param {*} id
   * @param {*} refName
   */
  renderRef(id, dataPath, refName) {
    const cssId = this.formatId(`${id}-${dataPath}`);
    const text = this.$(`#${cssId}-arrow`).html();
    if (text === this.arrowDown)
      this.$(`#${cssId}-arrow`).html(this.arrowRight);
    else this.$(`#${cssId}-arrow`).html(this.arrowDown);

    if (this.$(`#${cssId}-content`).html() !== "") {
      this.$(`#${cssId}-content`).toggle();
      this.$(`#${cssId}-preview`).toggle();
      return;
    }

    const ref = this.getRefData(id, refName);
    // console.log(id, refName, ref);
    const html = this.renderJson(ref.properties || ref);
    this.$(`#${cssId}-content`).html(html);
    this.$(`#${cssId}-preview`).hide();
    this.$(`${id}-${this.renderEntryName}`).addClassByName(this.themes[id]);
  }

  renderSons(id, dataPath) {
    if (window.event && (window.event.ctrlKey || window.event.metaKey)) {
      if (this.copyData && typeof this.copyData === "function") {
        const data = this.getData(id);
        const info = this.getValueByPath(data, dataPath);
        this.copyData(info);
        this.simpleSuccess(`该路径下数据已拷贝到剪贴板:<br>${dataPath}`);
      }
      return;
    }

    const cssId = this.formatId(`${id}-${dataPath}`);
    const text = this.$(`#${cssId}-arrow`).html();
    if (text === this.arrowDown)
      this.$(`#${cssId}-arrow`).html(this.arrowRight);
    else this.$(`#${cssId}-arrow`).html(this.arrowDown);

    if (this.$(`#${cssId}-content`).html() !== "") {
      this.$(`#${cssId}-content`).toggle();
      this.$(`#${cssId}-preview`).toggle();
      return;
    }

    const data = this.getData(id);
    const info = this.getValueByPath(data, dataPath);
    const { html } = this._renderData(info, id, dataPath);
    this.$(`#${cssId}-content`).html(html);
    this.$(`#${cssId}-preview`).hide();
    this.$(`${id}-${this.renderEntryName}`).addClassByName(this.themes[id]);
  }
}

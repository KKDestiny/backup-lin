function triggerNewWin(page, level) {
  if (!page) {
    return globals.simpleWarning("暂不支持", true);
  }

  const temp = page.split("/");
  const realPath = temp.reduce((prev, curr, index) => {
    const next = index === temp.length - 1 ? "" : ".tools.";
    prev += `${curr}${next}`;
    return prev;
  }, "");
  const pageInfo = globals.field.getValueByPath(navElemes, realPath);
  if (pageInfo) {
    const { name, description } = pageInfo;
    document.title = `${name} · ${description}`;
  }
  if (window.event.ctrlKey || window.event.metaKey) {
    globals.openNewWindow(page);
  } else {
    const prefix = level === 2 ? "../" : "./";
    window.location.href = `${prefix}${page}.html`;
  }
}

function generateSeed(length = 20) {
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

const initToastContainer = () => {
  $("body").append(`
    <div class="toast-container scrollbar" style="z-index:10000; position: fixed; right: 0; overflow-y: auto; top: 80px; height: 100%;"> 
    </div>
  `);
};
const insertAToast = (options = {}) => {
  const {
    title,
    msg,
    style,
    autohide = true,
    delay = 5000,
    color = "text-white",
    background = "primary",
  } = options;

  const msgId = generateSeed();
  let toastHTML = "";
  if (style === "simple") {
    toastHTML = `
    <div id="${msgId}" style="z-index:10000" class="toast align-items-center ${color} bg-${background} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${title}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
    `;
  } else {
    const _getColor = background => {
      switch (background) {
        case "primary":
          return "#0d6efd";
        case "danger":
          return "#dc3545";
        case "warning":
          return "#ffc107";
        case "success":
          return "#198754";
        case "dark":
          return "#212529";
        case "secondary":
          return "#6c757d";
      }
    };
    toastHTML = `
      <div id="${msgId}" class="toast" style="z-index:10000" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
        <svg class="bd-placeholder-img rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false">
          <rect width="100%" height="100%" fill="${_getColor(
            background
          )}"></rect>
        </svg>
          <strong class="me-auto">${title}</strong>
          <small class="text-muted">just now</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${msg}
        </div>
      </div>
    `;
  }
  $(".toast-container").prepend(toastHTML);
  const toastElem = document.getElementById(msgId);
  new bootstrap.Toast(toastElem, { autohide, delay });
  const myToast = bootstrap.Toast.getInstance(toastElem); // Returns a Bootstrap toast instance
  myToast.show();
  return myToast;
};

/**
 * 从path中读取field，并返回剩余路径
 * @param {*} path
 * @returns
 */
const readField = (path = "") => {
  const keys = path.split(".");
  let field = "";
  let rest = null;
  if (keys.length > 0) {
    field = keys[0];
    keys.shift();
    rest = keys.length > 0 ? keys.join(".") : null;
  } else if (path !== "") {
    field = path;
    rest = null;
  }

  return {
    field, // 返回第一个字段
    rest, // 返回剩余字段path，如果为null，表示没有剩余字段
  };
};
/**
 * 按路径写入数据
 * @param {*} src 原始数据，将写入符合条件的新数据
 * @param {*} path 新数据写入路径
 * @param {*} value 新数据
 * @param {*} strict 严格模式. 严格模式下，如果路径不合法将不写入；否则将强制按path写入数据
 */
const setValueByPath = (src = {}, path = "", value, strict) => {
  if (path === "") return src;

  const { field, rest } = readField(path);
  if (rest === null) {
    Object.assign(src, {
      [field]: value,
    });
  } else {
    if (src[field] === undefined) {
      if (strict) {
        return src;
      }
      Object.assign(src, { [field]: {} });
    }
    if (typeof src[field] !== "object") {
      if (!strict) {
        src[field] = {};
      }
    }
    setValueByPath(src[field], rest, value, strict);
  }
  return src;
};

const getValueByPath = (src = {}, path = "", strict) => {
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

class DatabaseClass {
  constructor(collection) {
    this.collection = collection;
    this.indexes = "_id";
    this.data = [];
  }
  removeAll() {
    this.data = [];
  }
  setDatas(arr) {
    this.data = arr;
  }
  insertMany(arr) {
    if (!Array.isArray(arr)) return false;
    let added = 0;
    let updated = 0;
    arr.reduce((temp, item, index) => {
      const doc = this.data.find(e => String(e._id) === String(item._id));
      if (doc) {
        this.data[index] = item;
        updated += 1;
      } else {
        this.data.push(item);
        added += 1;
      }
      return temp;
    }, []);
    return {
      added,
      updated,
      total: this.data.length,
    };
  }
  fitConditions(doc, conditions) {
    if (!conditions || typeof conditions !== "object") return true;
    return Object.entries(conditions || {}).reduce((temp, [field, val]) => {
      if (doc[field] === val) temp = true;
      return temp;
    }, false);
  }
  list(conditions) {
    const cloned = globals.lodash.cloneDeep(this.data);
    if (!conditions) return cloned;
    const result = [];
    for (let index = 0; index < cloned.length; index++) {
      const doc = cloned[index];
      if (this.fitConditions(doc, conditions)) result.push({ ...doc });
    }
    return result;
  }
  findOne(conditions) {
    return this.data.find(item => this.fitConditions(item, conditions));
  }
  updateOne(conditions, data = {}) {
    for (let index = 0; index < this.data.length; index++) {
      const item = this.data[index];
      if (this.fitConditions(item, conditions)) {
        Object.entries(data).reduce((temp, [path, value]) => {
          setValueByPath(this.data[index], path, value);
          return temp;
        }, 0);
      }
    }
  }
}

class ComponentClass {
  constructor(options = {}) {
    // 组件名称
    this.componentName = options.componentName || "NO_NAME";

    // 实例名称，必须和变量名保持一致
    this.instanceName = options.instanceName;

    // 打印管理
    this.enablePrint =
      options.enablePrint === undefined ? false : options.enablePrint;
    this.printTag = options.printTag || `components.${this.componentName}`;
  }

  print(...msg) {
    if (!this.enablePrint) return;
    console.log(this.printTag, ...msg);
  }
}

const isValidValue = value => {
  return typeof value === "number";
};
const sumTwoValue = (val1, val2) => {
  const a = isValidValue(val1) ? val1 : 0;
  const b = isValidValue(val2) ? val2 : 0;
  return a + b;
};

const sumAnnualArr = (
  arr1 = new Array(12).fill(0),
  arr2 = new Array(12).fill(0)
) => {
  if (!(arr2 instanceof Array)) {
    if (!(arr1 instanceof Array)) {
      return new Array(12).fill(0);
    }
    return arr1;
  }

  if (!(arr1 instanceof Array)) {
    if (!(arr2 instanceof Array)) {
      return new Array(12).fill(0);
    }
    return arr2;
  }
  return arr2.reduce((prev, curr, index) => {
    if (undefined === arr1[index]) {
      prev[index] = 0;
    }
    prev[index] = sumTwoValue(arr1[index], curr);
    return prev;
  }, new Array(12).fill(0));
};

const sumTwoSchedule = (schedule1 = {}, schedule2 = {}) => {
  // 计算两个报表的keys(年份)
  if (schedule1 === null && schedule2 === null) {
    return {};
  }
  if (schedule1 === null) {
    return schedule2;
  }
  if (schedule2 === null) {
    return schedule1;
  }

  const base = Object.assign({}, schedule2);
  return Object.entries(schedule1).reduce((pre, [year, arr]) => {
    return Object.assign(pre, { [year]: sumAnnualArr(arr, pre[year]) });
  }, base);
};
const sumTwoAnnualSchedule = (schedule1 = {}, schedule2 = {}) => {
  // 计算两个报表的keys(年份)
  if (schedule1 === null && schedule2 === null) {
    return {};
  }
  if (schedule1 === null) {
    return schedule2;
  }
  if (schedule2 === null) {
    return schedule1;
  }

  const base = Object.assign({}, schedule2);
  return Object.entries(schedule1).reduce((pre, [year, value]) => {
    return Object.assign(pre, { [year]: sumTwoValue(value, pre[year]) });
  }, base);
};

const isMonthlySchedule = schedule => {
  if (schedule === null) return true;
  if (schedule === undefined) return true;
  if (typeof schedule !== "object") return false;

  for (const [year, arr] of Object.entries(schedule)) {
    if (isNaN(Number(year))) return false;

    if (!Array.isArray(arr)) return false;
    if (arr.length !== 12) return false;
    for (const val of arr) {
      if (val !== null) {
        if (isNaN(val) || !(typeof val === "number")) return false;
      }
    }
  }

  return true;
};
const isAnnualSchedule = schedule => {
  if (schedule === null) return true;
  if (schedule === undefined) return true;
  if (typeof schedule !== "object") return false;

  for (const [year, val] of Object.entries(schedule)) {
    if (isNaN(Number(year))) return false;
    if (val !== null) {
      if (isNaN(val) || !(typeof val === "number")) return false;
    }
  }

  return true;
};

const isValidAnnualSchedule = schedule => {
  if (schedule === null) return false;
  if (schedule === undefined) return false;
  if (typeof schedule !== "object") return false;

  for (const [year, val] of Object.entries(schedule)) {
    if (isNaN(Number(year))) return false;
    if (val !== null) {
      if (isNaN(val) || !(typeof val === "number")) return false;
    }
  }

  return true;
};
const isValidMonthlySchedule = schedule => {
  if (schedule === null) return false;
  if (schedule === undefined) return false;
  if (typeof schedule !== "object") return false;

  for (const [year, arr] of Object.entries(schedule)) {
    if (isNaN(Number(year))) return false;

    if (!Array.isArray(arr)) return false;
    if (arr.length !== 12) return false;
    for (const val of arr) {
      if (val !== null) {
        if (isNaN(val) || !(typeof val === "number")) return false;
      }
    }
  }

  return true;
};

/**
 * 加总报表为一个总值
 * @param {2019:[1,2,3,4...]} schedule
 */
function getSummaryValueFromScheduleLoss(schedule = {}) {
  // if (!validateSchedule(schedule)) {
  //   return 0;
  // }
  if (schedule === null) return 0;
  return Object.values(schedule).reduce((sum, arr) => {
    if (!(arr instanceof Array)) {
      return sum;
    }
    return (
      sum +
      arr.reduce((acc, number) => {
        if (!isNaN(number)) {
          return acc + number;
        }
        return acc;
      }, 0)
    );
  }, 0);
}

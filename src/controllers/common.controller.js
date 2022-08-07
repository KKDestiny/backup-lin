/*
 * @Date: 2020-07-27 15:49:42
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */

export const echo = data => {
  const temp = { attr: 1 };
  return { data, ...temp };
};

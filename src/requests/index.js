/*
 * @Date: 2021-11-23 21:23:59
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import axios from "axios";

export default function createRequest(baseURL, headers = {}, options = {}) {
  const objects = Object.assign({}, { baseURL }, options);

  const request = axios.create({
    headers,
    ...objects,
  });
  request.interceptors.response.use(
    res => {
      if (res.data?.errors) {
        return Promise.resolve({
          errors: res.data?.errors,
          res,
        });
      }
      if (res.status >= 200 && res.status < 300) {
        return Promise.resolve({ data: res.data, res });
      }
    },
    error => {
      const res = error.response;
      if (!res) {
        return Promise.resolve({
          errors: {
            status: 400,
            message: error?.message,
          },
        });
      }
      const message = res.data?.errors?.message || res.statusText;
      const details = res.data?.errors?.details || "";
      return Promise.resolve({
        errors: {
          status: res.status,
          message,
          details,
        },
      });
    }
  );
  return request;
}

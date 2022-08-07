async function echo(payload, callback) {
  console.log("ws:echo", payload);
  callback(payload);
}

export default {
  echo,
};

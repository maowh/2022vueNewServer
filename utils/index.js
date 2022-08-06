const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { PRIVATE_KEY } = require("./constant");

// 判断是否对象类型
function isObject(o) {
  return Object.prototype.toString.call(o) === "[object object]";
}

// 获取token信息并截取token数据
function decode(o) {
  // const authorization = req.get("Authorization");
  const authorization = o;
  let token = "";
  if (authorization.indexOf("Bearer") >= 0) {
    token = authorization.replace("Bearer ", "");
  } else {
    token = authorization;
  }
  // 返回解析后的token数据
  return jwt.verify(token, PRIVATE_KEY);
}
// 进行md5加密
function md5(s) {
  // 注意参数需要为string类型，否则会报错
  return crypto.createHash("md5").update(String(s)).digest("hex");
}

module.exports = {
  isObject,
  decode,
  md5,
};

const express = require("express");
const jwt = require("jsonwebtoken");
const boom = require("boom");
const { body, validationResult } = require("express-validator");
const userService = require("../services/user");
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require("../utils/constant");
const { md5, decode } = require("../utils");
const Result = require("../models/Result");

const router = express.Router();

router.post(
  "/login",
  [
    body("username").isString().withMessage("username类型不正确"),
    body("password").isString().withMessage("password类型不正确"),
  ],
  async function (req, res, next) {
    // const { username, password } = req.body
    // if (username === 'super-admin' && password === '123456') {
    //   new Result({ username }, '登录成功').success(res)
    // } else {
    //   new Result({ username }, '登录失败').fail(res)
    // }
    // console.log('登录成功')
    const err = validationResult(req);
    // 如果报错，则抛出错误
    if (!err.isEmpty()) {
      const [{ msg }] = err.errors;
      next(boom.badRequest(msg));
    } else {
      const username = req.body.username;
      const password = req.body.password;
      // 对密码进行加密
      // const password = md5(`${req.body.password}${PWD_SALT}`)
      const user = await userService.login({ username, password }, next);
      console.log(user);
      // 如果用户存在，进行token认证，并设置token加密的字符串和设置token有效时长
      if (user) {
        const token = jwt.sign({ username }, PRIVATE_KEY, {
          expiresIn: JWT_EXPIRED,
        });
        // 返回token和登录成功信息，还有登录成功的标记0
        new Result({ token }, "登录成功").success(res);
      } else {
        new Result(null, "用户名或密码不存在").fail(res);
      }
    }
  }
);

router.get("/info", async function (req, res, next) {
  // console.log(req.rawHeaders[9]);
  // onsole.log(req[Symbol(kHeaders)].authorization);
  // 根据前端的请求拦截器，获取前端传过来的token并解析出用户名
  const decoded = decode(req.rawHeaders[9]);
  // 如果token有效并且token包含用户名
  if (decoded && decoded.username) {
    const user = await userService.findUser(
      { username: decoded.username },
      next
    );
    if (user) {
      delete user.password;
      new Result(user, "获取用户信息成功").success(res);
    } else {
      new Result(null, "获取用户信息失败").fail(res);
    }
  } else {
    new Result(null, "用户信息解析失败").fail(res);
  }
});

module.exports = router;

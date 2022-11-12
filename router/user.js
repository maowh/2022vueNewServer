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
  // onsole.log(req[Symbol(kHeaders)].authorization);
  // 根据前端的请求拦截器，获取前端传过来的token并解析出用户名
  const decoded = decode(req.rawHeaders[11]);
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

router.get("/userList", async function (req, res, next) {
  // 传对应的页码数currentPage和一个页面的记录行数pageSize参数
  const currentPage = req.query.page;
  const pageSize = req.query.size;
  const userLists = await userService.findUserList();
  // console.log(userLists.length);
  // console.log(userLists);
  const testArr = [];
  const resultArr = [];
  for (let i = 0; i < userLists.length; i++) {
    if (testArr.indexOf(userLists[i].username) === -1) {
      resultArr.push({
        id: userLists[i].id,
        username: userLists[i].username,
        avatar: userLists[i].avatar,
        mobile: userLists[i].mobile,
        openTime: userLists[i].openTime,
        role: [
          {
            title: userLists[i].title,
          },
        ],
      });
      testArr.push(userLists[i].username);
      // console.log(testArr)
    } else {
      for (let j = 0; j < resultArr.length; j++) {
        if (resultArr[j].username === userLists[i].username) {
          resultArr[j].role.push({
            title: userLists[i].title,
          });
          break;
        }
      }
    }
  }
  // console.log(resultArr, resultArr.length);
  if (resultArr) {
    let total = resultArr.length;
    // 计算总的页数
    // let pages = Math.ceil(total / pageSize);
    if (currentPage == "") {
      let list = resultArr.splice(0, pageSize);
      new Result({ list, total }, "获取信息成功").success(res);
    } else {
      let list = resultArr.splice((currentPage - 1) * pageSize, pageSize);
      new Result({ list, total }, "获取信息成功").success(res);
    }
  } else {
    new Result(null, "获取信息失败").fail(res);
  }
});

router.get("/userAll", async function (req, res, next) {
  const userAllList = await userService.findUserList();
  if (userAllList) {
    new Result(userAllList, "获取所有用户信息成功").success(res);
  } else {
    new Result(null, "获取所有用户信息失败").fail(res);
  }
});

router.get("/delete", function (req, res, next) {
  const { id } = req.query;
  if (!id) {
    next(boom.badRequest(new Error("参数id不能为空")));
  } else {
    userService
      .removeUser(id)
      .then(() => {
        new Result(null, "删除成功").success(res);
      })
      .catch((err) => {
        next(boom.badImplementation(err));
      });
  }
});

router.get("/detail", async function (req, res, next) {
  const { id } = req.query;
  console.log(req.query);
  if (!id) {
    next(boom.badRequest(new Error("参数id不能为空")));
  } else {
    const userDetail = await userService.userDetail(id);
    const testArr = [];
    const resultArr = [];
    for (let i = 0; i < userDetail.length; i++) {
      if (testArr.indexOf(userDetail[i].username) === -1) {
        resultArr.push({
          username: userDetail[i].username,
          avatar: userDetail[i].avatar,
          mobile: userDetail[i].mobile,
          openTime: userDetail[i].openTime,
          name: userDetail[i].name,
          gender: userDetail[i].gender,
          nationality: userDetail[i].nationality,
          address: userDetail[i].address,
          major: userDetail[i].major,
          glory: userDetail[i].glory,
          role: [
            {
              title: userDetail[i].title,
            },
          ],
        });
        testArr.push(userDetail[i].username);
        // console.log(testArr)
      } else {
        for (let j = 0; j < resultArr.length; j++) {
          if (resultArr[j].username === userDetail[i].username) {
            resultArr[j].role.push({
              title: userDetail[i].title,
            });
            break;
          }
        }
      }
    }
    if (resultArr) {
      new Result(resultArr, "获取用户信息成功").success(res);
    } else {
      new Result(null, "获取用户信息失败").fail(res);
    }
  }
});

router.get("/chapter", async function (req, res, next) {
  const chapter = await userService.findChapter();
  if (chapter) {
    new Result(chapter, "获取信息成功").success(res);
  } else {
    new Result(null, "获取信息失败").fail(res);
  }
});

router.get("/feature", async function (req, res, next) {
  const feature = await userService.findFeature();
  if (feature) {
    new Result(feature, "获取信息成功").success(res);
  } else {
    new Result(null, "获取信息失败").fail(res);
  }
});

router.post("/import", async function (req, res, next) {
  const err = validationResult(req);
  // 如果报错，则抛出错误
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    const importData = req.body;
    const userList = await userService.addUserList(importData);
    if (userList) {
      new Result({ userList }, "导入数据成功").success(res);
    } else {
      new Result(null, "导入数据失败").fail(res);
    }
  }
});

router.get("/");

module.exports = router;

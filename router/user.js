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
    const role = [];
    const menus = [];
    const points = [];
    if (user.length > 0) {
      for (let i = 0; i < user.length; i++) {
        if (user[i].roleId !== "") {
          role.push({ roleId: user[i].roleId, title: user[i].title });
        }
        if (user[i].permissionMark !== "") {
          menus.push(user[i].permissionMark);
        }
        if (user[i].permissionFunctionMark !== "") {
          points.push(user[i].permissionFunctionMark);
        }
      }
      const unique = (arr) => {
        const res = new Map();
        return arr.filter(
          (arr) => !res.has(arr.roleId) && res.set(arr.roleId, 1)
        );
      };
      const userTmp = {
        id: user[0].id,
        username: user[0].username,
        avatar: user[0].avatar,
        mobile: user[0].mobile,
        openTime: user[0].openTime,
        role: unique(role),
        permission: {
          menus: [...new Set(menus)],
          points: [...new Set(points)],
        },
      };
      if (userTmp) {
        // delete user.password;
        new Result(userTmp, "获取用户信息成功").success(res);
      } else {
        new Result(null, "获取用户信息失败").fail(res);
      }
    } else {
      const userInfo = await userService.findUserInfo(
        { username: decoded.username },
        next
      );
      const userTmpInfo = {
        id: userInfo.id,
        username: userInfo.username,
        avatar: userInfo.avatar,
        mobile: userInfo.mobile,
        openTime: userInfo.openTime,
        role: null,
        permission: {
          menus: [],
          points: [],
        },
      };
      new Result(userTmpInfo, "用户没有分配角色信息").success(res);
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

const express = require("express");
const jwt = require("jsonwebtoken");
const boom = require("boom");
const { body, validationResult } = require("express-validator");
const articleService = require("../services/article");
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require("../utils/constant");
const { md5, decode } = require("../utils");
const Result = require("../models/Result");

const router = express.Router();

router.get("/articleList", async function (req, res, next) {
  // 传对应的页码数currentPage和一个页面的记录行数pageSize参数
  const currentPage = req.query.page;
  const pageSize = req.query.size;
  const articleLists = await articleService.findArticleList();
  //   const testArr = [];
  //   const resultArr = [];
  //   for (let i = 0; i < userLists.length; i++) {
  //     if (testArr.indexOf(userLists[i].username) === -1) {
  //       resultArr.push({
  //         id: userLists[i].id,
  //         username: userLists[i].username,
  //         avatar: userLists[i].avatar,
  //         mobile: userLists[i].mobile,
  //         openTime: userLists[i].openTime,
  //         role: [
  //           {
  //             title: userLists[i].title,
  //           },
  //         ],
  //       });
  //       testArr.push(userLists[i].username);
  //     } else {
  //       for (let j = 0; j < resultArr.length; j++) {
  //         if (resultArr[j].username === userLists[i].username) {
  //           resultArr[j].role.push({
  //             title: userLists[i].title,
  //           });
  //           break;
  //         }
  //       }
  //     }
  //   }
  if (articleLists) {
    let total = articleLists.length;
    // 计算总的页数
    // let pages = Math.ceil(total / pageSize);
    if (currentPage == "") {
      let list = articleLists.splice(0, pageSize);
      new Result({ list, total }, "获取信息成功").success(res);
    } else {
      let list = articleLists.splice((currentPage - 1) * pageSize, pageSize);
      new Result({ list, total }, "获取信息成功").success(res);
    }
  } else {
    new Result(null, "获取信息失败").fail(res);
  }
});

router.get("/delete", function (req, res, next) {
  const { id } = req.query;
  if (!id) {
    next(boom.badRequest(new Error("参数id不能为空")));
  } else {
    articleService
      .delArticle(id)
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
    const articleDetail = await articleService.articleDetail(id);
    if (articleDetail) {
      new Result(articleDetail[0], "获取用户的角色信息成功").success(res);
    } else {
      new Result(null, "获取用户的角色信息失败").fail(res);
    }
  }
});

router.post("/create", async function (req, res, next) {
  const err = validationResult(req);
  // 如果报错，则抛出错误
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    const importData = req.body;
    const articleOne = await articleService.articleCreate(importData);
    if (articleOne) {
      new Result(null, "新增数据成功").success(res);
    } else {
      new Result(null, "新增数据失败").fail(res);
    }
  }
});

router.post("/edit", async function (req, res, next) {
  const err = validationResult(req);
  // 如果报错，则抛出错误
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    const importData = req.body;
    const importDataId = importData.id;
    delete importData.id;
    const articleEdit = await articleService.articleEdit(
      importData,
      importDataId
    );
    if (articleEdit) {
      new Result(null, "更新数据成功").success(res);
    } else {
      new Result(null, "更新数据失败").fail(res);
    }
  }
});

router.get("/");

module.exports = router;

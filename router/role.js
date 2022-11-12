const express = require("express");
const jwt = require("jsonwebtoken");
const boom = require("boom");
const { body, validationResult } = require("express-validator");
const roleService = require("../services/role");
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require("../utils/constant");
const { md5, decode } = require("../utils");
const Result = require("../models/Result");

const router = express.Router();

router.get("/rolelist", async function (req, res, next) {
  const roleList = await roleService.roleList();
  if (roleList) {
    new Result(roleList, "获取信息成功").success(res);
  } else {
    new Result(null, "获取信息失败").fail(res);
  }
});

router.get("/permissionlist", async function (req, res, next) {
  const permissionList = await roleService.permissionList();
  console.log(permissionList);
  const testArr = [];
  const resultArr = [];
  for (let i = 0; i < permissionList.length; i++) {
    if (
      testArr.indexOf(permissionList[i].permissionName) === -1 &&
      permissionList[i].permissionFunctionName !== null
    ) {
      resultArr.push({
        permissionId: permissionList[i].permissionId,
        permissionName: permissionList[i].permissionName,
        permissionMark: permissionList[i].permissionMark,
        permissionDesc: permissionList[i].permissionDesc,
        children: [
          {
            permissionFunctionId: permissionList[i].permissionFunctionId,
            permissionName: permissionList[i].permissionFunctionName,
            permissionMark: permissionList[i].permissionFunctionMark,
            permissionDesc: permissionList[i].permissionFunctionDesc,
          },
        ],
      });
      testArr.push(permissionList[i].permissionName);
      // console.log(testArr)
    } else if (permissionList[i].permissionFunctionName == null) {
      resultArr.push({
        permissionId: permissionList[i].permissionId,
        permissionName: permissionList[i].permissionName,
        permissionMark: permissionList[i].permissionMark,
        permissionDesc: permissionList[i].permissionDesc,
      });
    } else {
      for (let j = 0; j < resultArr.length; j++) {
        if (resultArr[j].permissionName === permissionList[i].permissionName) {
          resultArr[j].children.push({
            permissionFunctionId: permissionList[i].permissionFunctionId,
            permissionName: permissionList[i].permissionFunctionName,
            permissionMark: permissionList[i].permissionFunctionMark,
            permissionDesc: permissionList[i].permissionFunctionDesc,
          });
          break;
        }
      }
    }
  }
  if (resultArr) {
    new Result(resultArr, "获取信息成功").success(res);
  } else {
    new Result(null, "获取信息失败").fail(res);
  }
});

router.get("/findrole", async function (req, res, next) {
  const { id } = req.query;
  if (!id) {
    next(boom.badRequest(new Error("参数id不能为空")));
  } else {
    const findRole = await roleService.findRole(id);
    if (findRole) {
      new Result(findRole, "获取用户的角色信息成功").success(res);
    } else {
      new Result(null, "获取用户的角色信息失败").fail(res);
    }
  }
});

router.post("/updaterole", async function (req, res, next) {
  const err = validationResult(req);
  // 如果报错，则抛出错误
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    console.log(req.body[0].userId);
    roleService
      .delRole(req.body[0].userId)
      .then(() => {
        console.log("删除成功");
        roleService
          .updateRole(req.body)
          .then(() => {
            new Result(null, "更新角色成功").success(res);
          })
          .catch((err) => {
            next(boom.badImplementation(err));
          });
      })
      .catch((err) => {
        next(boom.badImplementation(err));
      });
  }
});

router.get("/findpermission", async function (req, res, next) {
  const { id } = req.query;
  if (!id) {
    next(boom.badRequest(new Error("参数id不能为空")));
  } else {
    const findPermission = await roleService.findPermission(id);
    if (findPermission) {
      new Result(findPermission, "获取用户的角色信息成功").success(res);
    } else {
      new Result(null, "获取用户的角色信息失败").fail(res);
    }
  }
});

router.get("/");

module.exports = router;

const express = require("express");
const jwt = require("jsonwebtoken");
const boom = require("boom");
const { body, validationResult } = require("express-validator");
const costService = require("../services/cost");
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require("../utils/constant");
const { md5, decode } = require("../utils");
const Result = require("../models/Result");

const router = express.Router();

router.get("/list", async function (req, res, next) {
  // 传对应的页码数currentPage和一个页面的记录行数pageSize参数
  const currentPage = req.query.page;
  const pageSize = req.query.size;
  const costLists = await costService.costList(req.query.table);
  if (costLists) {
    let total = costLists.length;
    // 计算总的页数
    // let pages = Math.ceil(total / pageSize);
    if (currentPage == "") {
      let list = costLists.splice(0, pageSize);
      new Result({ list, total }, "获取信息成功").success(res);
    } else {
      let list = costLists.splice((currentPage - 1) * pageSize, pageSize);
      new Result({ list, total }, "获取信息成功").success(res);
    }
  } else {
    new Result(null, "获取信息失败").fail(res);
  }
});

router.get("/listdisplay", async function (req, res, next) {
  // 传对应的页码数currentPage和一个页面的记录行数pageSize参数
  const currentPage = req.query.page;
  const pageSize = req.query.size;
  console.log(req.query);
  const costLists = await costService.costListDisplay(req.query.table);
  console.log(costLists);
  if (costLists) {
    let total = costLists.length;
    // 计算总的页数
    // let pages = Math.ceil(total / pageSize);
    if (currentPage == "") {
      let list = costLists.splice(0, pageSize);
      new Result({ list, total }, "获取信息成功").success(res);
    } else {
      let list = costLists.splice((currentPage - 1) * pageSize, pageSize);
      new Result({ list, total }, "获取信息成功").success(res);
    }
  } else {
    new Result(null, "获取信息失败").fail(res);
  }
});

router.get("/delete", function (req, res, next) {
  // const { id } = req.query;
  if (!req.query.id) {
    next(boom.badRequest(new Error("参数id不能为空")));
  } else {
    costService
      .costDel(req.query.table, req.query.id)
      .then(() => {
        new Result(null, "删除成功").success(res);
      })
      .catch((err) => {
        next(boom.badImplementation(err));
      });
  }
});

router.get("/detail", async function (req, res, next) {
  // const { id } = req.query;
  if (!req.query.id) {
    next(boom.badRequest(new Error("参数id不能为空")));
  } else {
    const costDetail = await costService.costDetail(
      req.query.table,
      req.query.id
    );
    if (costDetail) {
      new Result(costDetail[0], "获取信息成功").success(res);
    } else {
      new Result(null, "获取信息失败").fail(res);
    }
  }
});
router.get("/display", async function (req, res, next) {
  // const { id } = req.query;
  if (!req.query.id) {
    next(boom.badRequest(new Error("参数id不能为空")));
  } else {
    const costDetail = await costService.costDisplay(
      req.query.table,
      req.query.id
    );
    if (costDetail) {
      new Result(costDetail[0], "获取信息成功").success(res);
    } else {
      new Result(null, "获取信息失败").fail(res);
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
    const createData = req.body;
    const createDataValue = [createData.data._value];
    const field = Object.keys(createData.data._value)[0];
    const fieldValue = Object.values(createData.data._value)[0];
    const costExists = await costService.costExists(
      createData.table,
      // 获取判断值是否存在的字段名称
      field,
      fieldValue
      // createData.data._value.classificationName
    );
    if (!costExists) {
      const costInsert = await costService.costCreate(
        createData.table,
        createDataValue
      );
      if (costInsert) {
        new Result("新增数据成功", "新增数据成功").success(res);
      } else {
        new Result("新增数据失败", "新增数据失败").fail(res);
      }
    } else {
      new Result("数据已存在不能重复", "数据已存在不能重复").success(res);
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
    const editData = req.body;
    const editDataId = editData.data._value.id;
    delete editData.data._value.id;
    const field = Object.keys(editData.data._value)[0];
    const fieldValue = Object.values(editData.data._value)[0];
    const costExists = await costService.costExists(
      editData.table,
      // 获取判断值是否存在的字段名称
      field,
      fieldValue
      // editData.data._value.classificationName
    );
    if (!costExists) {
      console.log(editData);
      const costEdit = await costService.costEdit(
        editData.table,
        editData.data._value,
        editDataId
      );
      if (costEdit) {
        new Result("更新数据成功", "更新数据成功").success(res);
      } else {
        new Result("更新数据失败", "更新数据失败").fail(res);
      }
    } else {
      new Result("数据已存在不能重复", "数据已存在不能重复").success(res);
    }
  }
});

router.post("/editsingle", async function (req, res, next) {
  const err = validationResult(req);
  // 如果报错，则抛出错误
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    console.log(req.body);
    const editData = req.body;
    const editDataId = editData.data._value.id;
    delete editData.data._value.id;
    const field = Object.keys(editData.data._value)[0];
    const fieldValue = Object.values(editData.data._value)[0];
    const costEdit = await costService.costEdit(
      editData.table,
      editData.data._value,
      editDataId
    );
    if (costEdit) {
      new Result("更新数据成功", "更新数据成功").success(res);
    } else {
      new Result("更新数据失败", "更新数据失败").fail(res);
    }
  }
});

router.get("/");

module.exports = router;

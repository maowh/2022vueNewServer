const db = require("../db");
const boom = require("boom");

// 查询单个数据sql
function queryOne(sql, next) {
  const promise = new Promise((resolve, reject) => {
    db.querySql(sql)
      .then((results) => {
        if (results && results.length > 0) {
          resolve(results[0]);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
  return sqlWrapper(promise, next);
}

// 查询sql
function querySql(sql, next) {
  return sqlWrapper(db.querySql(sql), next);
}

// 插入sql
function insert(importData, tableName) {
  // return sqlWrapper(db.insert(importData, tableName), next);
  return db.insert(importData, tableName);
}

// 更新sql
function update(model, tableName, where) {
  // return sqlWrapper(db.insert(importData, tableName), next);
  return db.update(model, tableName, where);
}

// 使用boom抓取错误
function sqlWrapper(promise, next) {
  return new Promise((resolve, reject) => {
    promise
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        if (next) {
          next(boom.notImplemented(error));
        } else {
          reject(error);
        }
      });
  });
}

module.exports = { queryOne, querySql, insert, update };

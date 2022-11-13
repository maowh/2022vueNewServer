const mysql = require("mysql");
const { host, user, password, database } = require("./config");
const { isObject } = require("../utils");

function connect() {
  return mysql.createConnection({
    host,
    user,
    password,
    database,
    multipleStatements: true,
  });
}

function querySql(sql) {
  const conn = connect();
  return new Promise((resolve, reject) => {
    try {
      conn.query(sql, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    } catch (e) {
      reject(e);
    } finally {
      conn.end();
    }
  });
}
function queryOne(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql)
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
}
// function update(model, tableName, where) {
//   return new Promise((resolve, reject) => {
//     if (isObject(model)) {
//       reject(new Error("插入数据库失败，插入数据对象"));
//     } else {
//       const entry = [];
//       Object.keys(model).forEach((key) => {
//         if (model.hasOwnProperty(key)) {
//           entry.push(`\`${key}\`='${model[key]}'`);
//         }
//       });
//       if (entry.length > 0) {
//         let sql = `UPDATE \`${tableName}\` SET`;
//         sql = `${sql} ${entry.join(",")} ${where}`;

//         const conn = connect();
//         try {
//           conn.query(sql, (err, result) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve(result);
//             }
//           });
//         } catch (e) {
//           reject(e);
//         } finally {
//           conn.end();
//         }
//       } else {
//         reject(new Error("sql解析失败"));
//       }
//     }
//   });
// }
function insert(model, tableName) {
  console.log(tableName, model);
  return new Promise((resolve, reject) => {
    if (isObject(model)) {
      reject(new Error("插入数据库失败，插入数据对象"));
    } else {
      const keys = [];
      const values = [];
      model.forEach((item) => {
        let valuesTmp = [];
        Object.keys(item).forEach((key) => {
          if (item.hasOwnProperty(key)) {
            keys.push(`\`${key}\``);
            valuesTmp.push(`'${item[key]}'`);
          }
        });
        values.push(valuesTmp);
      });
      let keystmp = [];
      for (let i in keys) {
        if (keystmp.indexOf(keys[i]) == -1) {
          keystmp.push(keys[i]);
        }
      }
      // keys = tmp;
      if (keys.length > 0 && values.length > 0) {
        let sql = `INSERT INTO \`${tableName}\`(`;
        // const keysString = keystmp.join(",");
        const keysString = keystmp.toString();
        let valuesString = "";
        if (values.length > 1) {
          for (let i = 0; i < values.length; i++) {
            if (i == values.length - 1) {
              valuesString += `(${values[i].toString()})`;
            } else {
              valuesString += `(${values[i].toString()}),`;
            }
          }
        } else {
          // valuesString = values.join(",");
          // 单个记录插入
          valuesString = "(" + `${values.toString()}` + ")";
        }
        sql = `${sql}${keysString}) VALUES ${valuesString}`;
        console.log(sql);
        const conn = connect();
        try {
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        } catch (e) {
          reject(e);
        } finally {
          conn.end();
        }
      } else {
        reject(new Error("SQL解析失败"));
      }
      // model.forEach(function (n, i) {
      //   let _arr = [];
      //   for (let m in n) {
      //     _arr.push(n[m]);
      //   }
      //   values.push(_arr);
      // });
      // let sql = `INSERT INTO \`${tableName}\`(`;
    }
  });
}

module.exports = {
  // connect,
  querySql,
  queryOne,
  insert,
};

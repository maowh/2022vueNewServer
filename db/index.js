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
  // debug && console.log(sql)
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
//     if (!isObject(model)) {
//       reject(new Error('插入数据库失败，插入数据非对象'))
//     } else {
//       const entry = []
//       Object.keys(model).forEach((key) => {
//         if (model.hasOwnProperty(key)) {
//           entry.push(`\`${key}\`='${model[key]}'`)
//         }
//       })
//       if (entry.length > 0) {
//         let sql = `UPDATE \`${tableName}\` SET`
//         sql = `${sql} ${entry.join(',')} ${where}`
//         const conn = connect()
//         try {
//           conn.query(sql, (err, result) => {
//             if (err) {
//               reject(err)
//             } else {
//               resolve(result)
//             }
//           })
//         } catch (e) {
//           reject(e)
//         } finally {
//           conn.end()
//         }
//       } else {
//         reject(new Error('sql解析失败'))
//       }
//     }
//   })
// }
// function insert(model, tableName) {
//   return new Promise((resolve, reject) => {
//     if (!isObject(model)) {
//       reject(new Error('插入数据库失败，插入数据非对象'))
//     } else {
//       const keys = []
//       const values = []
//       Object.keys(model).forEach((key) => {
//         if (model.hasOwnProperty(key)) {
//           keys.push(`\`${key}\``)
//           values.push(`'${model[key]}`)
//         }
//       })
//       if (keys.length > 0 && values.length > 0) {
//         let sql = `INSERT INTO \`${tableName}\`(`
//         const keysString = keys.join(',')
//         const valuesString = values.join(',')
//         sql = `${sql}${keysString}) VALUES (${valuesString})`
//         const conn = connect()
//         try {
//           conn.query(sql, (err, result) => {
//             if (err) {
//               reject(err)
//             } else {
//               resolve(result)
//             }
//           })
//         } catch (e) {
//           reject(e)
//         } finally {
//           conn.end()
//         }
//       } else {
//         reject(new Error('SQL解析失败'))
//       }
//     }
//   })
// }
module.exports = {
  // connect,
  querySql,
  queryOne,
};

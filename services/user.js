const { queryOne, querySql, insert } = require("./index");

function login({ username, password }, next) {
  const sql = `select * from user where username='${username}' and password='${password}'`;
  return queryOne(sql, next);
}

function findUser({ username }, next) {
  const sql = `select * from user where username='${username}'`;
  return queryOne(sql, next);
}

function findUserList() {
  const sql =
    "SELECT a.id,a.username,a.avatar,a.mobile,a.openTime,c.title FROM userrole b RIGHT JOIN user a ON b.userId=a.id LEFT JOIN role c ON b.roleId=c.id";
  return querySql(sql);
}

// function exists(id) {
//   const { title, author, publisher } = book;
//   const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`;
//   return db.queryOne(sql);
// }

function removeUser(id) {
  if (id) {
    const removeUserSql = `delete from user where id='${id}'`;
    return querySql(removeUserSql);
  }
}

function userDetail(id) {
  if (id) {
    const userDetailSql = `SELECT a.id,a.username,a.avatar,a.mobile,a.openTime,c.title,d.name,d.gender,d.nationality,d.address,d.major,d.glory FROM userrole b INNER JOIN user a ON b.userId=a.id INNER JOIN role c ON b.roleId=c.id INNER JOIN userdetail d ON a.id=d.userId WHERE a.id='${id}'`;
    return querySql(userDetailSql);
  }
}

function findFeature() {
  const sql = "select * from feature";
  return querySql(sql);
}

function findChapter() {
  const sql = "select * from chapter";
  return querySql(sql);
}

// 新增用户信息
function addUserList(table) {
  const tableName = "user";
  return insert(table, tableName);
}

module.exports = {
  login,
  findUser,
  findFeature,
  findChapter,
  findUserList,
  addUserList,
  removeUser,
  userDetail,
};

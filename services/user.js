const { queryOne, querySql, insert } = require("./index");

function login({ username, password }, next) {
  const sql = `select * from user where username='${username}' and password='${password}'`;
  return queryOne(sql, next);
}

function findUser({ username }, next) {
  const sql = `SELECT c.id,c.username,c.avatar,c.mobile,c.openTime,b.id roleId,b.title,e.permissionMark,f.permissionFunctionMark FROM userrole a right JOIN role b ON a.roleId=b.id
  RIGHT JOIN user c ON a.userId=c.id
  INNER JOIN rolepermissionfunction d ON a.roleId=d.roleId
  LEFT JOIN permission e ON d.permissionId=e.id
  LEFT JOIN permissionfunction f ON d.permissionfunctionId=f.id
   WHERE c.username='${username}'`;
  return querySql(sql, next);
}
function findUserInfo({ username }, next) {
  const sql = `select user.id,user.username,user.avatar,user.mobile,user.openTime from user where username='${username}'`;
  return queryOne(sql, next);
}

function updatePwd({ username, password }, next) {
  const sql = `UPDATE user SET password='${password}' where username='${username}'`;
  return querySql(sql, next);
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
  findUserInfo,
  findFeature,
  findChapter,
  findUserList,
  addUserList,
  removeUser,
  userDetail,
  updatePwd,
};

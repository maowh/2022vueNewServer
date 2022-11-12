const { update } = require("../db");
const { queryOne, querySql, insert } = require("./index");

function roleList() {
  const sql = "select * from role";
  return querySql(sql);
}

function permissionList() {
  const sql =
    "SELECT a.id permissionId, a.permissionName,a.permissionMark,a.permissionDesc,b.id permissionFunctionId,b.permissionFunctionName,b.permissionFunctionMark,b.permissionFunctionDesc from permission a left join permissionfunction b on a.id=b.permissionId ORDER  BY CASE WHEN b.permissionId IS NULL THEN 1 ELSE 0 END,b.id";
  return querySql(sql);
}

function findRole(id) {
  if (id) {
    const sql = `SELECT a.userId,a.roleId,b.title FROM userrole a LEFT JOIN role b ON a.roleId=b.id WHERE userId='${id}'`;
    return querySql(sql);
  }
}

function delRole(id) {
  if (id) {
    const sql = `delete from userrole where userId='${id}'`;
    return querySql(sql);
  }
}

function updateRole(model) {
  const tableName = "userrole";
  return insert(model, tableName);
}

function findPermission(id) {
  if (id) {
    const sql = `SELECT * FROM rolepermissionfunction WHERE rolepermissionfunction.roleId='${id}'`;
    return querySql(sql);
  }
}

module.exports = {
  roleList,
  permissionList,
  findRole,
  delRole,
  updateRole,
  findPermission,
};

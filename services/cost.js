const e = require("express");
const { queryOne, querySql, insert, update } = require("./index");

// 判断是否存在
function costExists(table, field, data) {
  const sql = `SELECT * FROM ${table} WHERE ${field}='${data}'`;
  console.log("costExists", sql);
  return queryOne(sql);
}

// 查看列表
function costList(table) {
  // let sql = "";
  // if (table === "systeminformation") {
  //   sql =
  //     "SELECT a.id,a.SystemName,a.customerId,a.domainManagerId,b.customer AS customerName,c.domainManager AS domainManagerName FROM systeminformation a left JOIN customerinformation b ON a.customerId=b.id left JOIN domaininformation c ON a.domainManagerId=c.id";
  // } else {
  const sql = `SELECT * FROM ${table}`;
  // }
  return querySql(sql);
}

function costListDisplay(table) {
  let sql = "";
  if (table === "outsourcingcosts") {
    sql =
      "SELECT a.id,b.SystemName,a.year,a.month,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id";
  } else if (table === "systeminformation") {
    sql =
      "SELECT a.id,a.SystemName,a.customerId,a.domainManagerId,b.customer AS customerName,c.domainManager AS domainManagerName FROM systeminformation a left JOIN customerinformation b ON a.customerId=b.id left JOIN domaininformation c ON a.domainManagerId=c.id";
  }
  console.log(sql);
  return querySql(sql);
}

// 删除
function costDel(table, id) {
  if (id) {
    const sql = `delete from ${table} where id='${id}'`;
    return querySql(sql);
  }
}
// 查看详情
function costDetail(table, id) {
  const sql = `SELECT * FROM ${table} WHERE id='${id}'`;
  console.log(sql, table, id);
  return querySql(sql);
}

function costDisplay(table, id) {
  let sql = "";
  if (id) {
    if (table === "systeminformation") {
      sql = `SELECT a.id,a.SystemName,a.customerId,a.domainManagerId,b.customer AS customerName,c.domainManager AS domainManagerName FROM systeminformation a RIGHT JOIN customerinformation b ON a.customerId=b.id RIGHT JOIN domaininformation c ON a.domainManagerId=c.id where a.id=${id}`;
    } else if (table === "outsourcingcosts") {
      sql = `SELECT a.id,b.SystemName,c.customer AS customerName,d.businessDivision,d.businessLines,d.domain,d.domainManager,a.year,a.month,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id
      LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id where a.id=${id}`;
    } else if (table === "outsourcingcostsmoney") {
      sql = `SELECT * FROM outsourcingcostsmoney WHERE outsourcingCostsId=${id}`;
    }
    console.log(sql);
    return querySql(sql);
  }
}

// 新增
function costCreate(table, model) {
  //   const tableName = "article";
  return insert(model, table);
}

// 编辑
function costEdit(table, model, id) {
  //   const tableName = "article";
  const where = `where id=${id}`;
  console.log(table, model, id);
  return update(model, table, where);
}
module.exports = {
  costList,
  costDel,
  costDetail,
  costCreate,
  costEdit,
  costExists,
  costDisplay,
  costListDisplay,
};

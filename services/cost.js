const e = require("express");
const { queryOne, querySql, insert, update } = require("./index");

// 判断是否存在
// function costExists(table, field, data) {
function costExists(table, value) {
  let sqlconn = "";
  console.log(table, value);
  // 客户信息判断重复
  if (table === "customerinformation") {
    sqlconn = `select * from customerinformation where customer='${value.customer}'`;
    // 领域信息判断重复
  } else if (table === "domaininformation") {
    sqlconn = `select * from domaininformation where domain='${value.domain}'`;
    // 系数信息判断重复
  } else if (table === "coefficientinformation") {
    sqlconn = `select * from coefficientinformation where customerId='${value.customerId}' and year='${value.year}'`;
  }
  // 系统信息判断重复
  else if (table === "systeminformation") {
    sqlconn = `select * from systeminformation where SystemName='${value.SystemName}'`;
  }
  // 系统费用分解信息判断重复
  else if (table === "outsourcingcosts") {
    sqlconn = `select * from outsourcingcosts where systemId='${value.systemId}' and year='${value.year}' and month='${value.month}'`;
  }
  // const sql = `SELECT * FROM ${table} WHERE ${field}='${data}'`;
  console.log("costExists", sqlconn);
  if (sqlconn !== "") {
    return queryOne(sqlconn);
  }
}

// 根据条件获取值
function allSelect(table, value) {
  let sqlconn = "";
  console.log(table, value);
  // 人员负荷系数信息判断重复
  if (table === "personnelload" && value.id) {
    sqlconn = `select cast(sum(personnelload.load) AS DECIMAL(10,2)) as total  from personnelload  where id<>'${value.id}' and personnelId='${value.personnelId}' and YEAR='${value.year}'`;
  } else if (table === "personnelload" && !value.id) {
    sqlconn = `select cast(sum(personnelload.load) AS DECIMAL(10,2)) as total  from personnelload  where personnelId='${value.personnelId}' and YEAR='${value.year}'`;
  }
  console.log("allSelect", sqlconn);
  if (sqlconn !== "") {
    return queryOne(sqlconn);
  }
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
  console.log(table);
  let sql = "";
  if (table === "outsourcingcosts") {
    sql =
      "SELECT a.id,b.SystemName,a.year,a.month,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id";
  } else if (table === "systeminformation") {
    sql =
      "SELECT a.id,a.SystemName,a.customerId,a.domainManagerId,b.customer AS customerName,c.domainManager AS domainManagerName FROM systeminformation a left JOIN customerinformation b ON a.customerId=b.id left JOIN domaininformation c ON a.domainManagerId=c.id";
  } else if (table === "coefficientinformation") {
    sql =
      "SELECT a.*,b.customer FROM coefficientinformation a LEFT JOIN customerinformation b ON a.customerId=b.id";
  } else if (table === "personnelload") {
    sql =
      "SELECT a.id,b.name,a.`year`,c.SystemName,a.`load` FROM personnelload a LEFT JOIN personnel b ON a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id";
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
  console.log(table, id);
  let sql = "";
  if (id) {
    if (table === "systeminformation") {
      sql = `SELECT a.id,a.SystemName,a.customerId,a.domainManagerId,b.customer AS customerName,c.domainManager AS domainManagerName FROM systeminformation a RIGHT JOIN customerinformation b ON a.customerId=b.id RIGHT JOIN domaininformation c ON a.domainManagerId=c.id where a.id=${id}`;
    } else if (table === "outsourcingcosts") {
      sql = `SELECT a.id,a.systemId,b.SystemName,c.customer AS customerName,d.businessDivision,d.businessLines,d.domain,d.domainManager,a.year,a.month,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id
      LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id where a.id=${id}`;
    } else if (table === "outsourcingcostsmoney") {
      sql = `SELECT * FROM outsourcingcostsmoney WHERE outsourcingCostsId=${id}`;
    } else if (table === "coefficientinformation") {
      sql = `SELECT a.*,b.customer FROM coefficientinformation a LEFT JOIN customerinformation b ON a.customerId=b.id where a.id=${id}`;
    } else if (table === "personnelload") {
      sql = `SELECT a.id,a.personnelId,a.systemId,b.name,a.year,c.SystemName,a.load FROM personnelload a LEFT JOIN personnel b ON a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id WHERE a.id=${id}`;
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
  allSelect,
};

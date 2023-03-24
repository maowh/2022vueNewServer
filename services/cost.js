const e = require("express");
const { queryOne, querySql, insert, update } = require("./index");

// 判断是否存在
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
  console.log(table, value, value.customer);
  // 人员负荷系数信息判断重复
  if (table === "personnelload" && value.id) {
    sqlconn = `select cast(sum(personnelload.load) AS DECIMAL(10,2)) as total  from personnelload  where id<>'${value.id}' and personnelId='${value.personnelId}' and YEAR='${value.year}' and month='${value.month}'`;
  } else if (table === "personnelload") {
    sqlconn = `select cast(sum(personnelload.load) AS DECIMAL(10,2)) as total  from personnelload  where personnelId='${value.personnelId}' and YEAR='${value.year}' and month='${value.month}'`;
  } else if (table === "outsourcingcosts") {
    sqlconn = `select * from outsourcingcosts  where systemId='${value.systemId}' and YEAR='${value.year}'`;
  } else if (table === "outsourcingcostsplan") {
    sqlconn = `select * from outsourcingcostsplan  where systemId='${value.systemId}' and YEAR='${value.year}'`;
  } else if (table === "costsreportsearch" && !value.id) {
    if (value.customer) {
      sqlconn = `SELECT a.id,c.customer,b.SystemName,d.businessDivision,d.businessLines,d.domain,d.domainManager,a.year,a.month,e.totalAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId WHERE e.classification='运维' and c.customer like '%${value.customer}%'`;
    } else if (value.SystemName) {
      sqlconn = `SELECT a.id,c.customer,b.SystemName,d.businessDivision,d.businessLines,d.domain,d.domainManager,a.year,a.month,e.totalAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId WHERE e.classification='运维' and b.SystemName like '%${value.SystemName}%'`;
    } else if (value.domain) {
      sqlconn = `SELECT a.id,c.customer,b.SystemName,d.businessDivision,d.businessLines,d.domain,d.domainManager,a.year,a.month,e.totalAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId WHERE e.classification='运维' and d.domain like '%${value.domain}%'`;
    }
  }
  console.log("allSelect", sqlconn);
  if (sqlconn !== "") {
    return querySql(sqlconn);
  }
}

// 查看列表
function costList(table) {
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
  } else if (table === "outsourcingcostsplan") {
    sql =
      "SELECT a.id,b.SystemName,a.year,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcostsplan a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id";
  } else if (table === "systeminformation") {
    sql =
      "SELECT a.id,a.SystemName,a.customerId,a.domainManagerId,b.customer AS customerName,c.domainManager AS domainManagerName FROM systeminformation a left JOIN customerinformation b ON a.customerId=b.id left JOIN domaininformation c ON a.domainManagerId=c.id";
  } else if (table === "coefficientinformation") {
    sql =
      "SELECT a.*,b.customer FROM coefficientinformation a LEFT JOIN customerinformation b ON a.customerId=b.id";
  } else if (table === "personnelload") {
    sql =
      "SELECT a.id,b.name,a.year,a.month,c.SystemName,a.load FROM personnelload a LEFT JOIN personnel b ON a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id";
  } else if (table === "costsreport") {
    sql =
      "SELECT a.id,c.customer,b.SystemName,d.businessDivision,d.businessLines,d.domain,d.domainManager,a.year,a.month,e.totalAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId WHERE e.classification='运维'";
  } else if (table === "coststandard") {
    sql =
      "SELECT a.id,b.customer,a.year FROM coststandard a LEFT JOIN customerinformation b ON a.customerId=b.id";
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
  let idObj;
  console.log(Number.isInteger(parseInt(id)));
  if (!Number.isInteger(parseInt(id))) {
    idObj = JSON.parse(id);
    console.log(idObj, idObj.customerId, idObj.year);
  }
  let sql = "";
  if (id) {
    if (table === "systeminformation") {
      sql = `SELECT a.id,a.SystemName,a.customerId,a.domainManagerId,b.customer AS customerName,c.domainManager AS domainManagerName FROM systeminformation a RIGHT JOIN customerinformation b ON a.customerId=b.id RIGHT JOIN domaininformation c ON a.domainManagerId=c.id where a.id=${id}`;
    } else if (table === "outsourcingcosts") {
      sql = `SELECT a.id,a.systemId,b.SystemName,c.id AS customerId,c.customer AS customerName,d.businessDivision,d.businessLines,d.domain,d.domainManager,a.year,a.month,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id
      LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id where a.id=${id}`;
    } else if (table === "outsourcingcostsplan") {
      sql = `SELECT a.id,a.systemId,b.SystemName,c.id AS customerId,c.customer AS customerName,d.businessDivision,d.businessLines,d.domain,d.domainManager,a.year,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcostsplan a LEFT JOIN systeminformation b ON a.systemId=b.id
      LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.domainManagerId=d.id where a.id=${id}`;
    } else if (table === "outsourcingcostsmoney") {
      sql = `SELECT * FROM outsourcingcostsmoney WHERE outsourcingCostsId=${id} or outsourcingCostsPlanId=${id}`;
    } else if (
      table === "coefficientinformation" &&
      Number.isInteger(parseInt(id))
    ) {
      sql = `SELECT a.*,b.customer FROM coefficientinformation a LEFT JOIN customerinformation b ON a.customerId=b.id where a.id=${id}`;
    } else if (
      table === "coefficientinformation" &&
      !Number.isInteger(parseInt(id))
    ) {
      sql = `SELECT * FROM coefficientinformation where customerId=${idObj.customerId} and year=${idObj.year}`;
    } else if (table === "personnelload") {
      sql = `SELECT a.id,a.personnelId,a.systemId,b.name,a.year,a.month,c.SystemName,a.load FROM personnelload a LEFT JOIN personnel b ON a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id WHERE a.id=${id}`;
    } else if (table === "coststandard" && !Number.isInteger(parseInt(id))) {
      console.log(idObj.customerId, idObj.year);
      sql = `SELECT a.*,b.customer FROM coststandard a LEFT JOIN customerinformation b ON a.customerId=b.id where a.customerId=${idObj.customerId} and a.year=${idObj.year}`;
    } else if (table === "coststandard" && Number.isInteger(parseInt(id))) {
      console.log(id);
      sql = `SELECT a.*,b.customer FROM coststandard a LEFT JOIN customerinformation b ON a.customerId=b.id where a.id=${id}`;
    }
    console.log(sql);
    return querySql(sql);
  }
}

// 新增
function costCreate(table, model) {
  return insert(model, table);
}

// 编辑
function costEdit(table, model, id) {
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

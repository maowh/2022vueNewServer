const e = require("express");
const { queryOne, querySql, insert, update } = require("./index");
const dayjs = require("dayjs");

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
    sqlconn = `select * from systeminformation where SystemName='${value.SystemName}' and business='${value.business}' and customerId='${value.customerId}' and operationManagerId='${value.operationManagerId}' and developManagerId='${value.developManagerId}' `;
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
    let strValue1 = "";
    let strValue2 = "";
    let strValue3 = "";
    for (let key in value) {
      // 打印对象的key和value
      console.log(key, value[key]);
      if (key === "classification") {
        if (value[key] === "operationDevelopAmount") {
          strValue2 = "";
        } else if (value[key] === "developAmount") {
          strValue2 = "e.classification = '开发'";
        } else if (value[key] === "operation") {
          strValue2 = "e.classification = '运维'";
        }
      } else if (key === "year") {
        // if (value[key] instanceof Date && !isNaN(value[key])) {
          if (value[key]!== 'Invalid Date') {
          strValue3 = `a.year=${value[key]}`;
        } 
        console.log('strValue3',key,strValue3)
      } else if (key === "customer") {
        strValue1 = `c.customer like '%${value.customer}%'`;
      } else if (key === "SystemName") {
        strValue1 = `b.SystemName like '%${value.SystemName}%'`;
      } else if (key === "businessDivision") {
        strValue1 = `d.businessDivision like '%${value.domain}%'`;
      } else if (key === "businessLines") {
        strValue1 = `d.businessLines like '%${value.domain}%'`;
      } else if (key === "domain") {
        strValue1 = `d.domain like '%${value.domain}%'`;
      } else if (key === "business") {
        strValue1 = `b.business like '%${value.business}%'`;
      }
    }
    let where = "";
    if (strValue1 !== "" && strValue2 !== "" && strValue3 !== "") {
      where = " where " + strValue1 + " and " + strValue2 + " and " + strValue3;
    } else if (strValue1 === "" && strValue2 !== "" && strValue3 !== "") {
      where = " where " + strValue2 + " and " + strValue3;
    } else if (strValue1 === "" && strValue2 === "" && strValue3 !== "") {
      where = " where " + strValue3;
    } else if (strValue1 === "" && strValue2 !== "" && strValue3 === "") {
      where = " where " + strValue2;
    } else if (strValue1 !== "" && strValue2 === "" && strValue3 === "") {
      where = " where " + strValue1;
    } else if (strValue1 !== "" && strValue2 !== "" && strValue3 === "") {
      where = " where " + strValue1 + " and " + strValue2;
    } else if (strValue1 !== "" && strValue2 === "" && strValue3 !== "") {
      where = " where " + strValue1 + " and " + strValue3;
    }
    console.log(where);
    sqlconn =
      "SELECT a.id,c.customer,b.SystemName,(case when e.classification='开发' then f.businessDivision ELSE d.businessDivision end) AS businessDivision,(case when e.classification='开发' then f.businessLines ELSE d.businessLines end) AS businessLines,(case when e.classification='开发' then f.domain ELSE d.domain end) AS domain,b.business,(case when e.classification='开发' then f.domainManager ELSE d.domainManager end) AS domainManager,a.year,a.month,e.totalAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id LEFT JOIN domaininformation f ON b.developManagerId=f.id LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId" +
      where;
    // if (value.customer) {
    //   sqlconn = `SELECT a.id,c.customer,b.SystemName,b.business,d.businessDivision,d.businessLines,d.domain,d.domainManager,a.year,a.month,
    //   e.totalAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,
    //   e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id
    //   LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id
    //   LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId WHERE e.classification='运维' and c.customer like '%${value.customer}%'`;
    // }
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
  const currentYear = dayjs(new Date()).format("YYYY");
  if (table === "outsourcingcosts") {
    sql =
      "SELECT a.id,b.SystemName,a.year,a.month,a.reportedAmount,a.operationAmount,a.developAmount,a.contractAmount,a.taxAmount FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id";
  } else if (table === "outsourcingcostsplan") {
    sql =
      "SELECT a.id,b.SystemName,a.year,a.reportedAmount,a.operationAmount,a.developAmount,a.contractAmount,a.taxAmount FROM outsourcingcostsplan a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id";
  } else if (table === "systeminformation") {
    sql =
      "SELECT a.id,a.SystemName,a.business,a.customerId,a.operationManagerId,a.developManagerId,b.customer AS customerName,c.domainManager AS operationManagerName,d.domainManager AS developManagerName FROM systeminformation a left JOIN customerinformation b ON a.customerId=b.id left JOIN domaininformation c ON a.operationManagerId=c.id left JOIN domaininformation d ON a.developManagerId=d.id";
  } else if (table === "coefficientinformation") {
    sql =
      "SELECT a.*,b.customer FROM coefficientinformation a LEFT JOIN customerinformation b ON a.customerId=b.id";
  } else if (table === "personnelload") {
    sql =
      "SELECT a.id,b.name,a.year,a.month,c.SystemName,a.load FROM personnelload a LEFT JOIN personnel b ON a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id";
  } else if (table === "costsreport") {
    sql = `SELECT a.id,c.customer,b.SystemName,(case when e.classification='开发' then f.businessDivision ELSE d.businessDivision end) AS businessDivision,(case when e.classification='开发' then f.businessLines ELSE d.businessLines end) AS businessLines,(case when e.classification='开发' then f.domain ELSE d.domain end) AS domain,b.business,(case when e.classification='开发' then f.domainManager ELSE d.domainManager end) AS domainManager,a.year,a.month,e.totalAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id LEFT JOIN domaininformation f ON b.developManagerId=f.id LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId where a.year=${currentYear}`;
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
      sql = `SELECT a.id,a.SystemName,a.business,a.customerId,a.operationManagerId,a.developManagerId,b.customer AS customerName,c.domainManager AS operationManagerName,d.domainManager AS developManagerName FROM systeminformation a RIGHT JOIN customerinformation b ON a.customerId=b.id RIGHT JOIN domaininformation c ON a.operationManagerId=c.id RIGHT JOIN domaininformation d ON a.developManagerId=d.id where a.id=${id}`;
    } else if (table === "outsourcingcosts") {
      sql = `SELECT a.id,a.systemId,b.SystemName,c.id AS customerId,c.customer AS customerName,d.businessDivision,d.businessLines,d.domain,d.domainManager AS operationManagerName,e.domainManager AS developManagerName,a.year,a.month,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id
      LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id LEFT JOIN domaininformation e ON b.developManagerId=e.id where a.id=${id}`;
    } else if (table === "outsourcingcostsplan") {
      sql = `SELECT a.id,a.systemId,b.SystemName,c.id AS customerId,c.customer AS customerName,d.businessDivision,d.businessLines,d.domain,d.domainManager AS operationManagerName,e.domainManager AS developManagerName,a.year,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcostsplan a LEFT JOIN systeminformation b ON a.systemId=b.id
      LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id LEFT JOIN domaininformation e ON b.developManagerId=e.id where a.id=${id}`;
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

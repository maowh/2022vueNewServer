const e = require("express");
const { queryOne, querySql, insert, update } = require("./index");
const dayjs = require("dayjs");

// 判断是否存在
function costExists(table, value) {
  let sqlconn = "";
  console.log("数据表是否存在：", table, "校验值是否存在", value);
  // 客户信息判断重复
  if (table === "customerinformation") {
    sqlconn = `select * from customerinformation where customer='${value.customer}'`;
    // 领域信息判断重复
  } else if (table === "domaininformation") {
    sqlconn = `select * from domaininformation where domain='${value.domain}'`;
    // 类别信息判断重复
  } else if (table === "businessdomain") {
    sqlconn = `select * from businessdomain where businessName='${value.businessName}'`;
    // 系数信息判断重复
  } else if (table === "coefficientinformation") {
    if (!value.id) {
      sqlconn = `select * from coefficientinformation where customerId='${value.customerId}' and year='${value.year}'`;
    } else {
      sqlconn = `select * from coefficientinformation where id<>'${value.id}' and customerId='${value.customerId}' and year='${value.year}'`;
    }
  }
  // 系统信息判断重复
  else if (table === "systeminformation") {
    sqlconn = `select * from systeminformation where SystemName='${value.SystemName}' and business='${value.business}' and customerId='${value.customerId}' and operationManagerId='${value.operationManagerId}' `;
  }
  // 项目信息判断重复
  else if (table === "project") {
    sqlconn = `select * from project where projectName='${value.projectName}' and year='${value.year}' and id<>'${value.id}'`;
  }
  // 外采信息判断重复
  else if (table === "outsourcingamount") {
    sqlconn = `select * from outsourcingamount where projectId='${value.projectId}'  and category='${value.category}' and id<>'${value.id}'`;
  }
  // 人力信息判断重复
  else if (table === "manpowerinput") {
    sqlconn = `select * from manpowerinput where projectId='${value.projectId}' and category='${value.category}' and id<>'${value.id}'`;
  }
  // 系统费用分解信息判断重复
  else if (table === "outsourcingcosts") {
    sqlconn = `select * from outsourcingcosts where systemId='${value.systemId}' and year='${value.year}' and month='${value.month}'`;
  }
  // 人员矩阵判断累加值是否大于1
  else if (table === "projectcosts") {
    sqlconn = `select * from projectcosts where projectId='${value.projectId}' and year='${value.year}' and categoryName='${value.categoryName}'`;
  }
  // 项目费用信息判断重复，暂时不用
  else if (table === "personnelmatrix") {
    if (value.id) {
      // 修改
      sqlconn = `select IFNULL(sum(p.load),0)+${value.load} as total from personnelmatrix p where id<>${value.id} and personnelId=${value.personnelId} and year='${value.year}' having total>1`;
    } else {
      // 新增
      sqlconn = `select IFNULL(sum(p.load),0)+${value.load} as total from personnelmatrix p where year='${value.year}' and personnelId=${value.personnelId} having total>1`;
    }
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
  console.log(table, "value:", value.yearValue, value.customer);
  // 人员负荷系数信息判断重复
  if (table === "personnelload" && value.id) {
    // 修改时候判断
    sqlconn = `select cast(sum(personnelload.load) AS DECIMAL(10,2)) as total  from personnelload  where id<>'${value.id}' and personnelId='${value.personnelId}' and YEAR='${value.year}' and month='${value.month}'`;
  } else if (table === "personnelload") {
    // 新增时候判断
    sqlconn = `select cast(sum(personnelload.load) AS DECIMAL(10,2)) as total  from personnelload  where personnelId='${value.personnelId}' and YEAR='${value.year}' and month='${value.month}'`;
  } else if (table === "personnelmatrixAll") {
    sqlconn = `select sum(a.load) AS worktotal,a.year,b.name,c.business,b.attribute,b.station,b.Officelocation,b.Domainsplit,b.region,e.id,e.projectName,a.systemId,f.customer from personnelmatrix a left join personnel  b ON a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id right JOIN projectsystem d ON c.id=d.systemId left JOIN project e ON d.projectId=e.id LEFT JOIN customerinformation f ON b.customerId=f.id WHERE a.year=${value.yearValue}  AND e.year=${value.yearValue} GROUP BY e.id,e.YEAR,a.personnelId`;
  } else if (table === "projectmatrixAll") {
    sqlconn = `select sum(a.load) AS worktotal,a.year,b.attribute,c.business,e.id,e.projectName,a.systemId,f.customer from personnelmatrix a left join personnel  b ON a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id right JOIN projectsystem d ON c.id=d.systemId left JOIN project e ON d.projectId=e.id LEFT JOIN customerinformation f ON b.customerId=f.id WHERE a.year=${value.yearValue} AND e.year=${value.yearValue} GROUP BY e.id,c.business,b.attribute,e.YEAR`;
  } else if (table === "project") {
    sqlconn = `select * from project where year=${value.yearValue}`;
  } else if (table === "projectcostsAll") {
    sqlconn = `select a.id,a.projectName,a.year,e.customer,f.domain,d.business,(case when g.classification='本领域' then sum(g.totalAmount) ELSE null end) AS incomeAmount,(case when g.classification='外部门' then sum(g.totalAmount) ELSE null end) AS splitAmount from project a left join customerinformation e on a.customerId=e.id left join domaininformation f on a.operationManagerId=f.id  left join projectsystem b on a.id=b.projectId left join systeminformation d on b.systemId=d.id left join outsourcingcosts c on b.systemId=c.systemId left join outsourcingcostsmoney g on c.id=g.outsourcingCostsId where a.year=${value.yearValue} and c.year=${value.yearValue} group by d.business,g.classification`;
  } else if (table === "outsourcingcosts") {
    sqlconn = `select * from outsourcingcosts  where systemId='${value.systemId}' and YEAR='${value.year}'`;
  } else if (table === "outsourcingcostsplan") {
    sqlconn = `select * from outsourcingcostsplan  where systemId='${value.systemId}' and YEAR='${value.year}'`;
  } else if (table === "costsreportsearch" && !value.id) {
    let strValue1 = "";
    let strValue2 = "";
    let strValue3 = "";
    let strValue5 = "";
    for (let key in value) {
      // 打印对象的key和value
      console.log(key, value[key]);
      if (key === "classification") {
        if (value[key] === "operationDevelopAmount") {
          strValue2 = "";
        } else if (value[key] === "developAmount") {
          strValue2 = "classification = '开发'";
        } else if (value[key] === "operation") {
          strValue2 = "classification = '运维'";
        }
      } else if (key === "startmonth") {
        // } else if (key === "year") {
        // if (value[key] !== "Invalid Date") {
        //   strValue3 = `year=${value[key]}`;
        // }
        if (value[key] !== "Invalid Date") {
          strValue3 = `YEAR>=${value[key].substr(0, 4)} AND MONTH>=${value[
            key
          ].substr(4, 6)}`;
        }
        console.log("strValue3", key, strValue3);
      } else if (key === "endmonth") {
        if (value[key] !== "Invalid Date") {
          strValue5 = `YEAR<=${value[key].substr(0, 4)} AND MONTH<=${value[
            key
          ].substr(4, 6)}`;
        }
        console.log("strValue5", key, strValue5);
      } else if (key === "customer") {
        strValue1 = `customer like '%${value.customer}%'`;
      } else if (key === "SystemName") {
        // strValue1 = `b.SystemName like '%${value.SystemName}%'`;
        strValue1 = `SystemName like '%${value.SystemName}%'`;
      } else if (key === "businessDivision") {
        strValue1 = `businessDivision like '%${value.businessDivision}%'`;
      } else if (key === "businessLines") {
        strValue1 = `businessLines like '%${value.businessLines}%'`;
      } else if (key === "domain") {
        strValue1 = `domain like '%${value.domain}%'`;
      } else if (key === "business") {
        strValue1 = `business like '%${value.business}%'`;
      }
    }
    let where = "";
    if (strValue1 !== "" && strValue2 !== "" && strValue3 !== "") {
      where =
        " where " +
        strValue1 +
        " and " +
        strValue2 +
        " and " +
        strValue3 +
        " and " +
        strValue5;
    } else if (strValue1 === "" && strValue2 !== "" && strValue3 !== "") {
      where = " where " + strValue2 + " and " + strValue3 + " and " + strValue5;
    } else if (strValue1 === "" && strValue2 === "" && strValue3 !== "") {
      where = " where " + strValue3 + " and " + strValue5;
    } else if (strValue1 === "" && strValue2 !== "" && strValue3 === "") {
      where = " where " + strValue2;
    } else if (strValue1 !== "" && strValue2 === "" && strValue3 === "") {
      where = " where " + strValue1;
    } else if (strValue1 !== "" && strValue2 !== "" && strValue3 === "") {
      where = " where " + strValue1 + " and " + strValue2;
    } else if (strValue1 !== "" && strValue2 === "" && strValue3 !== "") {
      where = " where " + strValue1 + " and " + strValue3 + " and " + strValue5;
    }
    console.log(where);
    sqlconn =
      // "SELECT a.id,c.customer,b.SystemName,(case when e.classification='开发' then f.businessDivision ELSE d.businessDivision end) AS businessDivision,(case when e.classification='开发' then f.businessLines ELSE d.businessLines end) AS businessLines,(case when e.classification='开发' then f.domain ELSE d.domain end) AS domain,b.business,(case when e.classification='开发' then f.domainManager ELSE d.domainManager end) AS domainManager,a.year,a.month,e.totalAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id LEFT JOIN domaininformation f ON b.developManagerId=f.id LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId" +
      "SELECT *  FROM  (SELECT a.id,c.customer,b.SystemName,e.classification,(case when e.classification='开发' then f.businessDivision ELSE d.businessDivision end) AS businessDivision,(case when e.classification='开发' then f.businessLines ELSE d.businessLines end) AS businessLines,(case when e.classification='开发' then f.domain ELSE d.domain end) AS domain,b.business,(case when e.classification='开发' then f.domainManager ELSE d.domainManager end) AS domainManager,a.year,a.month,e.totalAmount,e.contractAmount,e.taxAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id LEFT JOIN domaininformation f ON b.developManagerId=f.id LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId)  AS z" +
      where;
    // if (value.customer) {
    //   sqlconn = `SELECT a.id,c.customer,b.SystemName,b.business,d.businessDivision,d.businessLines,d.domain,d.domainManager,a.year,a.month,
    //   e.totalAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,
    //   e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id
    //   LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id
    //   LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId WHERE e.classification='运维' and c.customer like '%${value.customer}%'`;
    // }
  } else if (table === "projectcostsSearch" && value) {
    let where = "";
    if (value !== "Invalid Date") {
      where = " and " + `a.year=${value}`;
    }
    console.log(where);
    sqlconn =
      "select a.id,a.projectName,a.year,e.customer,f.domain,d.business,(case when g.classification='本领域' then sum(g.totalAmount) ELSE null end) AS incomeAmount,(case when g.classification='外部门' then sum(g.totalAmount) ELSE null end) AS splitAmount from project a left join customerinformation e on a.customerId=e.id left join domaininformation f on a.operationManagerId=f.id  left join projectsystem b on a.id=b.projectId left join systeminformation d on b.systemId=d.id left join outsourcingcosts c on b.systemId=c.systemId left join outsourcingcostsmoney g on c.id=g.outsourcingCostsId where a.year=c.year " +
      where +
      " group by d.business,g.classification";
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
      "SELECT a.id,a.systemId,b.SystemName,b.business,c.customer,a.year,a.month,a.reportedAmount,a.operationAmount,a.developAmount,a.contractAmount,a.taxAmount FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id";
  } else if (table === "outsourcingcostsplan") {
    sql =
      "SELECT a.id,a.systemId,b.SystemName,a.year,a.reportedAmount,a.operationAmount,a.developAmount,a.contractAmount,a.taxAmount FROM outsourcingcostsplan a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id";
  } else if (table === "projectcosts") {
    sql =
      "SELECT a.id,a.projectId,b.projectName,c.customer as customerName,a.year,a.categoryName,a.TotalPurchaseAmount,a.capitaIncome FROM projectcosts a LEFT JOIN project b ON a.projectId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id";
  }
  // else if (table === "projectcostsAll") {
  //   sql =
  //     "select a.id,a.projectName,a.year,e.customer,f.domain,d.business,(case when g.classification='本领域' then sum(g.totalAmount) ELSE null end) AS incomeAmount,(case when g.classification='外部门' then sum(g.totalAmount) ELSE null end) AS splitAmount from project a left join customerinformation e on a.customerId=e.id left join domaininformation f on a.operationManagerId=f.id  left join projectsystem b on a.id=b.projectId left join systeminformation d on b.systemId=d.id left join outsourcingcosts c on b.systemId=c.systemId left join outsourcingcostsmoney g on c.id=g.outsourcingCostsId where a.year=c.year group by d.business,g.classification";
  // }
  else if (table === "systeminformation") {
    sql =
      "SELECT a.id,a.SystemName,a.business,a.customerId,a.operationManagerId,a.developManagerId,b.customer AS customerName,c.domainManager AS operationManagerName,d.domainManager AS developManagerName FROM systeminformation a left JOIN customerinformation b ON a.customerId=b.id left JOIN domaininformation c ON a.operationManagerId=c.id left JOIN domaininformation d ON a.developManagerId=d.id";
  } else if (table === "project") {
    sql =
      "SELECT a.id,a.projectName,a.year,a.customerId,a.operationManagerId,a.developManagerId,b.customer AS customerName,c.domainManager AS operationManagerName,c.domain,c.businessLines FROM project a left JOIN customerinformation b ON a.customerId=b.id left JOIN domaininformation c ON a.operationManagerId=c.id";
  } else if (table === "coefficientinformation") {
    sql =
      "SELECT a.*,b.customer FROM coefficientinformation a LEFT JOIN customerinformation b ON a.customerId=b.id";
  } else if (table === "personnel") {
    sql =
      "SELECT a.id,a.name,a.business,a.attribute,a.station,a.officelocation,a.domainsplit,a.region,b.customer,c.domain FROM personnel a LEFT JOIN customerinformation b ON a.customerId=b.id LEFT JOIN domaininformation c ON a.domainId=c.id";
  } else if (table === "personnelload") {
    sql =
      "SELECT a.id,a.systemId,a.personnelId,b.name,b.business,a.yearMonth,a.startYearMonth,a.endYearMonth,a.year,a.month,c.SystemName,a.load FROM personnelload a LEFT JOIN personnel b ON a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id";
  } else if (table === "personnelmatrix") {
    sql =
      "SELECT a.id,a.personnelId,a.year,a.systemId,a.load,b.name,c.SystemName FROM personnelmatrix a LEFT JOIN personnel b ON  a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id";
  } else if (table === "costsreport") {
    sql = `SELECT a.id,c.customer,b.SystemName,(case when e.classification='开发' then f.businessDivision ELSE d.businessDivision end) AS businessDivision,(case when e.classification='开发' then f.businessLines ELSE d.businessLines end) AS businessLines,(case when e.classification='开发' then f.domain ELSE d.domain end) AS domain,b.business,(case when e.classification='开发' then f.domainManager ELSE d.domainManager end) AS domainManager,a.year,a.month,e.totalAmount,e.contractAmount,e.taxAmount,e.totalManpower,e.systemEngineer,e.seniorSap,e.seniorSoftwareEngineer,e.dbaEngineer,e.seniorSystemEngineer,e.intermediateSap,e.seniorDbaEngineer,e.softwareEngineer FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id LEFT JOIN domaininformation f ON b.developManagerId=f.id LEFT JOIN outsourcingcostsmoney e ON a.id=e.outsourcingCostsId where a.year=${currentYear}`;
  } else if (table === "coststandard") {
    sql =
      "SELECT a.id,b.customer,a.year FROM coststandard a LEFT JOIN customerinformation b ON a.customerId=b.id";
  } else if (table === "manpowerinput") {
    sql =
      "SELECT a.id,a.projectId,a.RegularEmployees,a.OutsourcedEmployees,a.category,b.projectName,b.year FROM manpowerinput a LEFT JOIN project b ON a.projectId=b.id";
  } else if (table === "outsourcingamount") {
    sql =
      "SELECT a.id,a.projectId,a.PurchaseAmount,a.NonPurchaseAmount,a.category,b.projectName,b.year FROM outsourcingamount a LEFT JOIN project b ON a.projectId=b.id";
  }
  console.log(sql);
  return querySql(sql);
}

// 删除
function costDel(table, id) {
  if (table === "projectsystem" && id) {
    const sql = `delete from ${table} where projectId='${id}'`;
    console.log(sql);
    return querySql(sql);
  } else if (id) {
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
      sql = `SELECT a.id,a.SystemName,a.business,a.customerId,a.operationManagerId,a.developManagerId,b.customer AS customerName,c.domainManager AS operationManagerName FROM systeminformation a RIGHT JOIN customerinformation b ON a.customerId=b.id RIGHT JOIN domaininformation c ON a.operationManagerId=c.id  where a.id=${id}`;
    }
    if (table === "personnel") {
      sql = `SELECT a.id,a.name,a.business,a.attribute,a.station,a.officelocation,a.domainsplit,a.region,a.customerId,b.customer,a.domainId,c.domain,c.domainManager FROM personnel a LEFT JOIN customerinformation b ON a.customerId=b.id LEFT JOIN domaininformation c ON a.domainId=c.id WHERE a.id=${id}`;
    }
    if (table === "systeminformationC") {
      sql = `SELECT * from systeminformation where customerId=${id}`;
    }
    if (table === "systeminformationP") {
      sql = `SELECT a.id,a.projectName,c.SystemName,c.business FROM project a LEFT JOIN projectsystem  b ON a.id=b.projectId LEFT JOIN systeminformation c ON b.systemId=c.id WHERE a.id=${id}`;
    } else if (table === "project") {
      sql = `SELECT a.id,a.projectName,a.year,a.customerId,a.operationManagerId,a.developManagerId,b.customer AS customerName,c.domainManager AS operationManagerName FROM project a RIGHT JOIN customerinformation b ON a.customerId=b.id RIGHT JOIN domaininformation c ON a.operationManagerId=c.id where a.id=${id}`;
    } else if (table === "outsourcingcosts") {
      sql = `SELECT a.id,a.systemId,b.SystemName,c.id AS customerId,c.customer AS customerName,d.businessDivision,d.businessLines,d.domain,d.domainManager AS operationManagerName,e.domainManager AS developManagerName,a.year,a.month,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcosts a LEFT JOIN systeminformation b ON a.systemId=b.id
      LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id LEFT JOIN domaininformation e ON b.developManagerId=e.id where a.id=${id}`;
    } else if (table === "outsourcingcostsplan") {
      sql = `SELECT a.id,a.systemId,b.SystemName,c.id AS customerId,c.customer AS customerName,d.businessDivision,d.businessLines,d.domain,d.domainManager AS operationManagerName,e.domainManager AS developManagerName,a.year,a.reportedAmount,a.contractAmount,a.taxAmount FROM outsourcingcostsplan a LEFT JOIN systeminformation b ON a.systemId=b.id
      LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id LEFT JOIN domaininformation e ON b.developManagerId=e.id where a.id=${id}`;
    } else if (table === "outsourcingcostsmoney") {
      sql = `SELECT * FROM outsourcingcostsmoney WHERE outsourcingCostsId=${id} or outsourcingCostsPlanId=${id}`;
    } else if (table === "projectcosts") {
      sql = `SELECT a.id,a.projectId,b.projectName,c.id AS customerId,c.customer AS customerName,d.businessDivision,d.businessLines,d.domain,d.domainManager AS operationManagerName,e.domainManager AS developManagerName,a.year,a.categoryName,a.incomeAmount,a.splitAmount,a.RegularEmployees,a.OutsourcedEmployees,a.PurchaseAmount,a.NonPurchaseAmount,a.TotalPurchaseAmount,a.capitaIncome FROM projectcosts a LEFT JOIN project b ON a.projectId=b.id
      LEFT JOIN customerinformation c ON b.customerId=c.id LEFT JOIN domaininformation d ON b.operationManagerId=d.id LEFT JOIN domaininformation e ON b.developManagerId=e.id where a.id=${id}`;
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
      sql = `SELECT a.id,a.personnelId,a.systemId,b.name,a.yearMonth,a.startYearMonth,a.endYearMonth,a.year,a.month,c.SystemName,a.load FROM personnelload a LEFT JOIN personnel b ON a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id WHERE a.id=${id}`;
    } else if (table === "personnelmatrix") {
      sql = `SELECT a.id,a.personnelId,a.year,a.systemId,a.load,b.name,c.SystemName FROM personnelmatrix a LEFT JOIN personnel b ON  a.personnelId=b.id LEFT JOIN systeminformation c ON a.systemId=c.id WHERE a.id=${id}`;
    } else if (table === "coststandard" && !Number.isInteger(parseInt(id))) {
      console.log(idObj.customerId, idObj.year);
      sql = `SELECT a.*,b.customer FROM coststandard a LEFT JOIN customerinformation b ON a.customerId=b.id where a.customerId=${idObj.customerId} and a.year=${idObj.year}`;
    } else if (table === "coststandard" && Number.isInteger(parseInt(id))) {
      console.log(id);
      sql = `SELECT a.*,b.customer FROM coststandard a LEFT JOIN customerinformation b ON a.customerId=b.id where a.id=${id}`;
    } else if (table === "manpowerinput") {
      sql = `SELECT a.id,a.projectId,a.RegularEmployees,a.OutsourcedEmployees,a.category,b.projectName,b.year FROM manpowerinput a LEFT JOIN project b ON a.projectId=b.id WHERE a.id=${id}`;
    } else if (table === "outsourcingamount") {
      sql = `SELECT a.id,a.projectId,a.PurchaseAmount,a.NonPurchaseAmount,a.category,b.projectName,b.year FROM outsourcingamount a LEFT JOIN project b ON a.projectId=b.id WHERE a.id=${id}`;
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

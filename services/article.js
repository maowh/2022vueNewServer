// const { update } = require("../db");
const { queryOne, querySql, insert, update } = require("./index");

function findArticleList() {
  const sql = "SELECT * FROM article";
  return querySql(sql);
}
function delArticle(id) {
  if (id) {
    const sql = `delete from article where id='${id}'`;
    return querySql(sql);
  }
}
function articleDetail(id) {
  if (id) {
    const sql = `SELECT * FROM article WHERE id='${id}'`;
    return querySql(sql);
  }
}

// 新增文章信息
function articleCreate(model, modelId) {
  const tableName = "article";
  return insert(model, tableName, modelId);
}

// 编辑文章信息
function articleEdit(model, id) {
  const tableName = "article";
  const where = `where id=${id}`;
  return update(model, tableName, where);
}

module.exports = {
  findArticleList,
  delArticle,
  articleDetail,
  articleCreate,
  articleEdit,
};

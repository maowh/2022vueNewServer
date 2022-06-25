const { queryOne } = require('./index')

function login({ username, password }, next) {
  const sql = `select * from vue_user where username='${username}' and password='${password}'`
  return queryOne(sql, next)
}

function findUser({ username }, next) {
  const sql = `select * from vue_user where username='${username}'`
  return queryOne(sql, next)
}

module.exports = {
  login,
  findUser,
}

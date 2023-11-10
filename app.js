const express = require("express");
const logger = require("morgan");
const router = require("./router/index");
const bodyParser = require("body-parser");
const cors = require("cors");

// 当前版本保存
const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", router);

// app.get('/', function (req, res) {
//   res.send('hello node')
// })

// // 设置跨域请求
// app.all("*", function (req, res, next) {
//   // 设置请求头
//   // 允许所有来源访问
//   res.header("Access-Control-Allow-Origin", "*");
//   // 用来判断request来自ajax还是传统请求
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Orgin,X-Requested-With,Content-Type,Accept"
//   );
//   // 允许访问的方式
//   res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//   // 修改程序信息与版本
//   res.header("X-Powered-By", "3.2.1");
//   // 内容类型：如果是post请求必须指定这个属性
//   res.header("Content-Type", "application/json;charset=utf-8");
//   next();
// });

const server = app.listen(5001, function () {
  const { address, port } = server.address();
  console.log("HTTP服务启动成功：http://%s:%s", address, port);
});

process.on("uncaughtException", function (err) {
  console.log("uncaughtException", err);
});
const unhandledRejections = new Map();
process.on("unhandledRejection", (reason, promise) => {
  unhandledRejections.set(promise, reason);
});

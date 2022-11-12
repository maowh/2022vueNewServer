const express = require("express");
const logger = require("morgan");
const router = require("./router/index");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", router);

// app.get('/', function (req, res) {
//   res.send('hello node')
// })
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

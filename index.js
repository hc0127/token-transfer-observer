var express = require("express");
var app = express();
let server = require('http').createServer();
let WSServer = require('ws').Server;

const bodyParser = require("body-parser");
const cors = require('cors');

app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({
    origin: '*'
}));

var transaction = require("./app/transaction.js");
var user = require("./app/user.js");
// var admin = require("./app/admin.js");

app.use("/",require("./middleware"));
app.use("/transaction", transaction);
app.use("/user", user);
// app.use("/admin", admin);

server.on('request', app);

let wss = new WSServer({
  server: server
});

var socket = require("./app/socket.js");

wss.on('connection', function connection(ws) {
  console.log('new client connected')
    ws.on('message', (req) => {
      var fetch = JSON.parse(req.toString());
      const type = fetch.type;
      const data = fetch.data;
      socket[type](data,ws);
    });
});

server.listen(4000);
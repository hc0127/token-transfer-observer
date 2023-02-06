var express = require("express");
var app = express();
const bodyParser = require("body-parser");
const cors = require('cors');

app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({
    origin: '*'
}));

var transaction = require("./app/transaction.js");
var user = require("./app/user.js");

app.use("/",require("./middleware"));
app.use("/transaction", transaction);
app.use("/user", user);

app.listen(4000);
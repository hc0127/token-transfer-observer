var mysql = require("mysql2");
const dbInfo = require("../config/database.json");

delete dbInfo["database"];
var con = mysql.createConnection(dbInfo);

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");

  con.query("CREATE DATABASE obridge", function (err, result) {
    if (err) throw err;
    console.log("Database created");

    dbInfo["database"] = "obridge";

    let db_con = mysql.createConnection(dbInfo);

    let sql =
      "CREATE TABLE `transactions` (`uid` int(11) NOT NULL,`fToken` varchar(256) NOT NULL,`tToken` varchar(256) DEFAULT NULL,`fAddress` varchar(256) NOT NULL,`tAddress` varchar(256) NOT NULL,`amount` varchar(256) NOT NULL,`fChainID` varchar(256) NOT NULL,`tChainID` varchar(256) NOT NULL,`fTxnID` varchar(256) DEFAULT NULL,`tTxnID` varchar(256) DEFAULT NULL,`form` tinyint(1) NOT NULL,`status` tinyint(1) NOT NULL DEFAULT 0) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
    db_con.execute(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created");

      sql = "ALTER TABLE `transactions` ADD PRIMARY KEY (`uid`);";
      db_con.execute(sql, function (err, result) {
        if (err) throw err;
        console.log("Set Primary Key");

        sql =
          "ALTER TABLE `transactions` MODIFY `uid` int(11) NOT NULL AUTO_INCREMENT;";
        db_con.execute(sql, function (err, result) {
          if (err) throw err;
          console.log("Set uid as AUTO_INCREMENT");

          process.exit();
        });
      });
    });
  });
});

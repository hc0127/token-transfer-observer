var mysql = require("mysql2");
const dbInfo = require("../config/database.json");

delete dbInfo["database"];
console.log(dbInfo);
var con = mysql.createConnection(dbInfo);

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");

  con.query("CREATE DATABASE tokenobserver", function (err, result) {
    if (err) throw err;
    console.log("Database created");

    dbInfo["database"] = "tokenobserver";

    let db_con = mysql.createConnection(dbInfo);

    let sql = "CREATE TABLE `admin` (`email` varchar(255) NOT NULL,`password` varchar(255) NOT NULL,`token` varchar(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    db_con.execute(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created");

      sql = "INSERT INTO `admin` (`email`, `password`, `token`) VALUES('admin@gmail.com', '21232f297a57a5a743894a0e4a801fc3', '7C5gDCLdRfycbl6aSjhd5up2bAv4OhBP9glX9XWfM32rbtu46rfDUqz69ptC')";
      db_con.execute(sql, function (err, result) {
        if (err) throw err;
        console.log('Insert init admin data');

        sql = "CREATE TABLE `bulletballances` (`b_id` int(11) NOT NULL,`email` varchar(255) NOT NULL,`balance` int(11) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        db_con.execute(sql, function (err, result) {
          if (err) throw err;
          console.log("Table created");
          
          sql = "ALTER TABLE `bulletballances` ADD PRIMARY KEY (`b_id`);";
          db_con.execute(sql, function (err, result) {
            if (err) throw err;
            console.log("Set Primary Key");
    
            sql = "ALTER TABLE `bulletballances` MODIFY `b_id` int(11) NOT NULL AUTO_INCREMENT;";
            db_con.execute(sql, function (err, result) {
              if (err) throw err;
              console.log("Set b_id as AUTO_INCREMENT");
              
              sql = "CREATE TABLE `transactions` (`t_id` int(11) NOT NULL,`transaction_id` varchar(255) NOT NULL,`sender` varchar(255) NOT NULL,`amount` varchar(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
              db_con.execute(sql, function (err, result) {
                if (err) throw err;
                console.log("Table created");
                
                sql = "ALTER TABLE `transactions` ADD PRIMARY KEY (`t_id`);";
                db_con.execute(sql, function (err, result) {
                  if (err) throw err;
                  console.log("Set Primary Key");
          
                  sql = "ALTER TABLE `transactions` MODIFY `t_id` int(11) NOT NULL AUTO_INCREMENT;";
                  db_con.execute(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Set b_id as AUTO_INCREMENT");

                    sql = "CREATE TABLE `users` (`u_id` int(11) NOT NULL,`userID` varchar(255) NOT NULL,`password` varchar(255) NOT NULL,`email` varchar(255) NOT NULL,`wallet` varchar(255) NOT NULL,`token_amount` double NOT NULL,`score_amount` double NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
                    db_con.execute(sql, function (err, result) {
                      if (err) throw err;
                      console.log("Table created");
                      
                      sql = "ALTER TABLE `users` ADD PRIMARY KEY (`u_id`);";
                      db_con.execute(sql, function (err, result) {
                        if (err) throw err;
                        console.log("Set Primary Key");
                
                        sql = "ALTER TABLE `users` MODIFY `u_id` int(11) NOT NULL AUTO_INCREMENT;";
                        db_con.execute(sql, function (err, result) {
                          if (err) throw err;
                          console.log("Set u_id as AUTO_INCREMENT");
                          
                          process.exit();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
    
  });
});

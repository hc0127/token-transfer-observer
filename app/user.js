var express = require("express");
var router = express.Router();

var database = require("./database.js");

var md5 = require('md5');
var randomstring = require("randomstring");

router.get("/list", async (req, res) => {
  let rows = await database.select("users");

  if (rows.status == "failed") {//database failed
    res.send({ status: "failed", msg: "get list: db error" });
  } else {
    res.send(rows);
  }
});

// router.post("/login", async (req, res) => {
//   let info = req.body;

//   let rows = await database.select("users", {
//     email: info.email,
//   });

//   if (rows.data.length > 0) {
//     rows = await database.select("users", {
//       email: info.email,
//       password: md5(info.password),
//     });
//     if (rows.data.length > 0) {
//       var token = randomstring.generate(60);
//       await database.update("users", {
//         token: token
//       }, {
//         email: info.email
//       });
//       res.send({
//         status: 'success',
//         token: token
//       })
//     } else {
//       res.send({
//         status: 'error',
//         msg: 'password is not correct'
//       })
//     }
//   } else {
//     res.send({
//       status: 'error',
//       msg: 'email is not correct'
//     })
//   }
// });

// router.post("/register", async (req, res) => {
//   let data = req.body;

//   let rows = await database.selectOr("users", {
//     userID: data.userID,
//     wallet: data.wallet,
//     email: data.email,
//   });

//   if (rows.status == "failed") {//database failed
//     res.send({ status: "failed", msg: "get: db error" });
//   } else {
//     if (rows.data.length > 0) {
//       res.send({
//         status: 'error',
//         msg: 'already registered'
//       })
//     } else {
//       rows = await database.select("transactions", {
//         sender: data.wallet,
//       });

//       if (rows.status == "failed") {//database failed
//         res.send({ status: "failed", msg: "get: db error" });
//       } else {
//         var token_amount = 0;
//         rows.data.map(row => {
//           token_amount += row.amount * 1;
//         })

//         var verify_code = randomstring.generate(20);

//         rows = await database.insert("users", {
//           ...data,
//           token_amount: token_amount,
//           password:md5(data.password),
//           verified:0,
//           verify_code:verify_code
//         });
        
//         const sendmail = require('sendmail')();
//         sendmail({
//             from: 'no-reply@yourdomain.com',
//             to: data.email,
//             subject: 'confirmable verify code',
//             html: '<h1>Confirm your email address</h1><p>Your confirmation code is below — enter it in your open browser window and we\'ll help you get signed in.</p><p>verify code:'+ verify_code + '</p>',
//           }, function(err, reply) {
//             console.log(err && err.stack);
//             console.dir(reply);
//         });

//         rows = await database.select("users");
//         if (rows.status == "failed") {//database failed
//           res.send({ status: "failed", msg: "get list: db error" });
//         } else {
//           res.send(rows);
//         }
//       }
//     }
//   }
// });

router.post("/exchange_score", async (req, res) => {
  let params = req.body;
  let result = await database.update("users", {
    u_id: params.u_id,
    token_amount: params.token_amount * 1 - params.exchange_score * 1,
    score_amount: params.score_amount * 1 + params.exchange_score * 1
  }, {
    u_id: params.u_id
  });
  if (result.status == "failed") {//database failed
    res.send({ status: "failed", msg: "exchange token: db error" });
  } else {
    let rows = await database.select("users");

    if (rows.status == "failed") {//database failed
      res.send({ status: "failed", msg: "get list: db error" });
    } else {
      res.send(rows);
    }
  }
});

//export this router to use in our index.js
module.exports = router;

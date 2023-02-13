var express = require("express");
var router = express.Router();

var database = require("./database.js");

var md5 = require('md5');
var randomstring = require("randomstring");

router.post("/login", async (req, res) => {
  let info = req.body;

  let rows = await database.select("admin", {
    email: info.email,
  });

  if (rows.data.length > 0) {
    rows = await database.select("admin", {
      email: info.email,
      password: md5(info.password)
    });
    if (rows.data.length > 0) {
      var token = randomstring.generate(60);
      await database.update("admin", {
        token: token
      }, {
        email: info.email
      });
      res.send({
        status: 'success',
        token: token
      })
    } else {
      res.send({
        status: 'error',
        msg: 'password is not correct'
      })
    }
  } else {
    res.send({
      status: 'error',
      msg: 'email is not correct'
    })
  }
});

//export this router to use in our index.js
module.exports = router;

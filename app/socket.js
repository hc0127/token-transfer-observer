var express = require("express");
var router = express.Router();

var database = require("./database.js");

var md5 = require('md5');
var randomstring = require("randomstring");

module.exports = {
  admin_login: async (data,ws) => {
    let info = data;
    console.log('admin login', info);
  
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
        ws.send(JSON.stringify({
          type: "admin_login",
          data: {status: 'success',token: token}
        }));
      } else {
        ws.send(JSON.stringify({
          type: "admin_login",
          data: {status: 'error',msg: 'password is not correct'}
        }));
      }
    } else {
      ws.send(JSON.stringify({
        type: "admin_login",
        data: {status: 'error',msg: 'email is not correct'}
      }));
    }
  },
  login: async (data,ws) => {
    var[name, password] = data.toString().split('\t');
    console.log('login',name,password);
  
    rows = await database.select("users", {
      userID: name,
      password: md5(password),
    });

    balances = await database.select("bulletballances", {
      email:rows.data[0].email
    });

    if (rows.data.length > 0) {
      var wallet = randomstring.generate(40);
      await database.update("users", {
        wallet: wallet
      }, {
        userID: name
      });

      var player = {
        name : rows.data[0].userID,
        password : rows.data[0].password,
        email : rows.data[0].email,
        walletaddress : rows.data[0].wallet,
        coin : balances.data[0].balance
      }

      ws.send(JSON.stringify({
        type: "success",
        data: JSON.stringify(player)
      }));
    } else {
      ws.send(JSON.stringify({
        type: "failed",
        data: 'UserId or Password is incorrect'
      }));
    }
  },
  OnRegister: async (data,ws) =>{
    var[name, password, email, walletaddress] = data.toString().split('\t');
    console.log('register',name,password,email,walletaddress);
    
    let rows = await database.selectOr("users", {
      userID: name,
      email: email,
      wallet: walletaddress,
    });
  
    if (rows.status == "failed") {//database failed
      ws.send(JSON.stringify({
        type: "failed",
        data: "Register failed1"
      }));
    } else {
      if (rows.data.length > 0) {//already registered username, email, wallet
        ws.send(JSON.stringify({
          type: "failed",
          data: "Register failed2"
        }));
      } else {
        rows = await database.select("transactions", {
          sender: walletaddress,
        });
  
        if (rows.status == "failed") {//database failed
          ws.send(JSON.stringify({
            type: "failed",
            data: "Register failed3"
          }));
        } else {
          var token_amount = 0;//calc token amount
          rows.data.map(row => {
            token_amount += row.amount * 1;
          })
  
          rows = await database.insert("users", {
            userID:name,
            email:email,
            password:md5(password),
            wallet:walletaddress,
            token_amount: token_amount,
            score_amount: 0,
          });

          rows = await database.insert("bulletballances", {
            email:email,
            balance:0
          });
        
          rows = await database.select("users");
          if (rows.status == "failed") {//database failed
            ws.send(JSON.stringify({
              type: "failed",
              data: "Register failed4"
            }));
          } else {
            ws.send(JSON.stringify({
              type: "success",
              data: "Register successfully"
            }));    
          }
        }
      }
    }
  },
  verify: async (data,ws) =>{
    var [email] = data.toString().split('\t');
    
    var verify_code = randomstring.generate(20);

    const sendmail = require('sendmail')({
      smtpPort: 587,
      smtpHost: 'smtp.gmail.com'
    });

    sendmail({
        from: 'gwangyan0208@gmail.com',
        to: email,
        subject: 'confirmable verify code',
        html: '<h1>Confirm your email address</h1><p>Your confirmation code is below — enter it in your open browser window and we\'ll help you get signed in.</p><p>verify code:'+ verify_code + '</p>',
      }, function(err, reply) {        
        if(!err){         
          
          ws.send(JSON.stringify({
            status:'verify_code',
            data:verify_code
          }))
        }
    });
  },

  getUserProfile: async (data,ws) =>{
    var[email] = data.toString().split('\t');
    console.log('getUserProfile',email);
  
    rows = await database.select("users", {
      email: email
    });
    
    bullet = await database.select("bulletballances", {
      email: email
    });

    if (rows.data.length > 0) {
      var player = {
        name : rows.data[0].userID,
        email : rows.data[0].email,
        walletaddress : rows.data[0].wallet,
        coin : bullet.data[0].balance
      }

      ws.send(JSON.stringify({
        type: "profile",
        data: JSON.stringify(player)
      }));
    }
  },

  updateprofile: async (data,ws) =>{
    var[name, email, walletaddress, prevEmail] = data.toString().split('\t');
    console.log('updateprofile',name, email, walletaddress, prevEmail);
    let rows = await database.select("users", {
      email: prevEmail,
    });

    if(rows.data.length > 0 ){//update
      var u_id = rows.data[0].u_id;
      await database.update("bulletballances", {
        userID : name,
        email : email,
        wallet : walletaddress
      }, {
        u_id: u_id
      });

      ws.send(JSON.stringify({
        status:'success',
        data:'update successfully'
      }));
    }else{
      ws.send(JSON.stringify({
        status:'failed',
        data:'update failed'
      }));
    }
  },

  userDetail: async(data, ws) =>{
    var[email] = data.toString();
    console.log('updateprofile',email);
    let rows = await database.select("bulletballances", {
      email: email,
    });

    let info = rows.data[0];
    ws.send(JSON.stringify({
      type:'userdetail',
      data:info.balance + "\t" +  info.email
    }));
  },

  savebalance: async (data,ws) =>{
    var[email, balance] = data.toString().split('\t');
    console.log('savebalance',email,balance);
    
    let rows = await database.select("bulletballances", {
      email: email,
    });

    await database.update("bulletballances", {
      balance: balance
    }, {
      email: email
    });

    ws.send(JSON.stringify({
      type:'success',
      data:balance
    }));
  },

  buybalance: async (data,ws) =>{
    var[email, balance] = data.toString().split('\t');
    console.log('buybalance',email,balance);

    let users = await database.select("users", {
      email: email,
    });
    
    let balances = await database.insert("bulletballances", {
      email:email,
    });

    if(users.data[0].token_amount < balance*10000){
      let token_amount = users.data[0].token_amount - balance*10000;
      let curbalance = balances.data[0].balances + balance;

      var u_id = users.data[0].u_id;
      await database.update("users", {
        token_amount : token_amount,
      }, {
        u_id: u_id
      });
      
      var b_id = balances.data[0].b_id;
      await database.update("bulletballances", {
        balance : curbalance,
      }, {
        b_id: b_id
      });

      ws.send(JSON.stringify({
        status:'success',
        data:curbalance
      }));
    }else{
      ws.send(JSON.stringify({
        status:'failed',
        data:'buy balance failed'
      }));
    }
  },

  sellbalance: async (data,ws) =>{
    var[email, balance] = data.toString().split('\t');
    console.log('sellbalance',email,balance);

    let users = await database.select("users", {
      email: email,
    });
    
    let balances = await database.insert("bulletballances", {
      email:email,
    });

    if(balances.data[0].balance > balance){
      let token_amount = users.data[0].token_amount + balance*10000;
      let curbalance = balances.data[0].balances - balance;

      var u_id = users.data[0].u_id;
      await database.update("users", {
        token_amount : token_amount,
      }, {
        u_id: u_id
      });
      
      var b_id = balances.data[0].b_id;
      await database.update("bulletballances", {
        balance : curbalance,
      }, {
        b_id: b_id
      });

      ws.send(JSON.stringify({
        status:'success',
        data:curbalance
      }));
    }else{
      ws.send(JSON.stringify({
        status:'failed',
        data:'sell balance failed'
      }));
    }
  }
};

var express = require("express");
var router = express.Router();

var Web3 = require("web3");
var database = require("./database.js");
const chainList = require("../config/chain.json");
const routerABI = require("../abis/TransferRouter.json");

router.post("/register/:tx_hash", async (req, res) => {
  
  let tx_hash = req.params.tx_hash;

  if (chainList[25] == null) {
    res.send({ status: "failed", msg: "register: wrong chain id" });
    return;
  }

  let web3 = new Web3(chainList[25]["rpcUrl"]);

  //check if exist token transaction
  let rows = await database.select("transactions", {
    transaction_id:tx_hash
  });

  if (rows.status == "failed") {//database failed
    res.send({ status: "failed", msg: "register: db error" });
  } else if (rows.data.length > 0) {//registered
    res.send({ status: "failed", msg: "register: registered transaction" });
  } else {
    try {
      web3.eth.getTransaction(tx_hash, async(error, tx_info) => {
        if (error != null) {
          res.send({
            status: "failed",
            msg: "register: tx hash is not correct",
          });
          return;
        }

        let fRouterContract = new web3.eth.Contract(
          routerABI,
          chainList[25]["routerAddress"]
        );

        fRouterContract
          .getPastEvents("Transfer", {
            fromBlock: tx_info.blockNumber,
            toBlock: tx_info.blockNumber,
          })
          .then(async (events) => {
            let event = events.filter((event) => {
              return event.transactionHash === tx_hash;
            });
            if (event.length <= 0) {
              res.send({
                status: "failed",
                msg: "register: tx hash is not correct",
              });
              return;
            }else{
              if (
                tx_info.to.toLowerCase() !=
                  chainList[25]["routerAddress"].toLowerCase() ||
                tx_info.status === false
              ) {
                res.send({
                  status: "failed",
                  msg: "register: tx hash is not correct",
                });
                return;
              }
      
              let rows = await database.insert("transactions", {
                transaction_id:tx_hash,
                sender:event[0]["returnValues"][0],
                amount:event[0]["returnValues"][2] * 1,
              });
      
              if(rows.status == "success"){
                res.send({
                  status:"success",
                  msg:"registered successfully",
                });
      
                database.plus('users','token_amount',event[0]["returnValues"][2] * 1,{wallet:event[0]["returnValues"][0]});
              }else{
                res.send({
                  status: "failed",
                  msg: "database query error",
                });
              }
            }
          });
      });
    } catch (error) {
      console.log(error);

      res.send({ status: "failed" });
    }
  }
});

router.get("/get/:wallet", async (req, res) =>{
});

router.get("/list", async (req, res) =>{
  //get wallet info
  let rows = await database.select("transactions");
  if (rows.status == "failed") {//database failed
    res.send({ status: "failed", msg: "get list: db error" });
  } else {
    res.send(rows);
  }
});

//export this router to use in our index.js
module.exports = router;

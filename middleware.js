const express = require("express");
var database = require("./app/database.js");

module.exports = async (req, res, next) => {
    console.log(req.url);
    if (req.url == "/admin/login" || req.url == "/user/login" || req.url == "/user/register") {
        next();
    } else {
        var token = req.headers['token'];
        console.log('1');
        let tokenCheck = await database.select("admin", { token: token });
        console.log('2');

        if (tokenCheck.data.length < 0 || tokenCheck.data.status == 'error') {
            res.send('not access');
        } else {
            next();
        }
    }
}
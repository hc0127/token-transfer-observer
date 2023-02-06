const express = require("express");
var database = require("./app/database.js");

module.exports = async (req, res, next) => {
    if (req.url == "/user/login" || req.url == "/user/register") {
        next();
    } else {
        var token = req.headers['token'];
        let tokenCheck = await database.select("admin", { token: token });

        if (tokenCheck.data.length < 0 || tokenCheck.data.status == 'error') {
            res.send('not access');
        } else {
            next();
        }
    }
}
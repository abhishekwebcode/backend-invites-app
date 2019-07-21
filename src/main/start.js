//logging for all requests
var fs = require('fs');
var util = require('util');

/*
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var today = mm + '/' + dd + '/' + yyyy;
console.log(process.cwd());
console.log = function () {
    try {
        tempLog.call(0, ...arguments);
    } catch (e) {
    }
    try {
        fs.appendFileSync(`LOG.log`,util.format.apply(null, arguments) + '\n',{flags:'as+'});
    } catch (e) {
    }
}
*/
//console.error = console.log;
// initialize express app
var path = require('path');
const formidableMiddleware = require('express-formidable');
const events = require(`events`);
const eventEmitter = new events.EventEmitter();
const ObjectId = require('mongodb').ObjectId;
const mongo = require("../mongodb/mongodb");
var getDB = mongo;
const {parse, stringify} = require('flatted/cjs');
process.env.NODE_ENV = 'production';
const fcm = require(`../FCM/init`);
const express = require('express');
const asyncer = require('../util/asyncHandler');
const app = express();
app.set('wrap',asyncer);
app.set(`FCM`,fcm);
app.use(formidableMiddleware());
function modifyResponseBody(req, res, next) {
    var oldSend = res.send;
    res.send = function (data) {
        // arguments[0] (or `data`) contains the response body
        console.log(`OUTPUT\n`,data);
        oldSend.apply(res, arguments);
    }
    next();
}
app.use(modifyResponseBody);
//app.use(express.urlencoded({extended: true}));
//app.use(cookieParser());
app.set(`db`, mongo);
app.set(`id`, ObjectId);
app.set(`event`, eventEmitter);
app.set(`invite_link`,`  https://play.google.com/store/apps/details?id=com.easyparty.invitation&hl=fr`);
// Do all auth functions
let user_auth = require(`../auth/user_auth`);
app.all(`/`,function (req,res) {
    res.json({
        date : new Date()
    });
    res.end();
    return;
})
app.all(`/app/*`,function(req,res) {
    res.send(`Forgot password content will be hosted here when hosting from client is received,thanks`);
    res.end();
    return;
})

app.all('/password/reset', asyncer(user_auth.resetPassword));
app.all('/signup', asyncer(user_auth.sign_up));
app.all(`/login`, asyncer(user_auth.login));
app.all('/google_auth', asyncer(user_auth.google_auth));
app.all('/facebook_auth', asyncer(user_auth.facebook));
// require auth to proceed
require(`../classes/jwt-check`)(app);
//All other session related functions below
//enable self identity functions
require(`../me/init`)(app);
// enable event handlers and functions
require(`../events/init`)(app);
// enable to-do functions
require(`../todo/init`)(app);
// enable gifts functions
require(`../gifts/init`)(app);
app.use(function (a,b,c,d) {
    console.log(`at last`);
    console.log(arguments);
    return;
});
// add error handler
app.use((err, req, res, next) => {
    // log the error...
    console.debug(arguments);
    res.json({success:false,message:`Server error occurred`});
    res.end();
    return;
});
app.listen(
    process.env.PORT || 2082,
    () =>
        console.log(
            `Example app listening on port ${process.env.PORT || 2082} !`
        )
);
process.on("uncaughtException", function () {
    console.log(arguments);
});
process.on("uncaughtRejection", function () {
    console.log(arguments);
});

//console.log(app);
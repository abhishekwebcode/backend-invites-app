console.clear();
// initialize express app
var path = require('path');
const formidableMiddleware = require('express-formidable');
const fs = require(`fs`);
global.fs = fs;
const events = require(`events`);
const eventEmitter = new events.EventEmitter();
const ObjectId = require('mongodb').ObjectId;
const mongo = require("../mongodb/mongodb");
console.dir(mongo.cache);
var getDB = mongo;
const {parse, stringify} = require('flatted/cjs');
process.env.NODE_ENV = 'production';
const fcm = require(`../FCM/init`);
const express = require('express');
const app = express();
app.set(`FCM`,fcm);
app.use(formidableMiddleware());
function modifyResponseBody(req, res, next) {
    console.dir(req);
    var oldSend = res.send;
    res.send = function (data) {
        // arguments[0] (or `data`) contains the response body
        console.dir(data);
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
// Do all auth functions
let user_auth = require(`../auth/user_auth`);
let n = new Date().toUTCString();
app.all(`/`,function (req,res) {
    res.json({
        date : new Date()
    });res.end();return;
})
app.all(`/app/*`,function(req,res) {
    res.send(`Forgot password content will be hosted here when hosting from client is received,thanks`);
    res.end();
    return;
})
app.all('/signup', user_auth.sign_up);
app.all(`/login`, user_auth.login);
app.all('/google_auth', user_auth.google_auth);
app.all('/facebook_auth', user_auth.facebook);
app.use(function (a,b,c,d) {
    console.log(arguments, this);
});
// require auth to proceed
require(`../classes/jwt-check`)(app);
//All other session related functions below
//enable self identity functions
require(`../me/init`)(app);
app.use(function (err, req, res, next) {
    console.log(`ERROR`, arguments);
});
// enable event handlers and functions
require(`../events/init`)(app);
// enable todo functions
require(`../todo/init`)(app);
// enable gifts functions
require(`../gifts/init`)(app);
// add error handler
app.use((err, req, res, next) => {
    // log the error...
    console.debug(arguments);
    res.json({success:false,message:`Server error occurred`});
    return;
})
app.listen(
    process.env.PORT || 3000,
    () =>
        console.log(
            `Example app listening on port ${process.env.PORT || 3000} !`
        )
);
process.on("uncaughtException", function () {
    console.log(arguments);
});
process.on("uncaughtRejection", function () {
    console.log(arguments);
})
console.dir(app);
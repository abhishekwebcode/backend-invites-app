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
const express = require('express');
const app = express();
app.use(formidableMiddleware());
function modifyResponseBody(req, res, next) {
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
    res.send(Date.now());
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

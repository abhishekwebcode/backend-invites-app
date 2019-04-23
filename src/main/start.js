console.clear();
// initialize express app
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const formidableMiddleware = require('express-formidable');
const fs = require(`fs`);
global.fs=fs;
const events = require(`events`);
const eventEmitter = new events.EventEmitter();
const ObjectID = require('mongodb').ObjectId;
const mongo = require("../mongodb/mongodb");
console.dir(mongo)
var getDB=mongo;
const {parse, stringify} = require('flatted/cjs');
process.env.NODE_ENV = 'production';
const express = require('express');
const app = express();
app.use(formidableMiddleware());
//app.use(express.urlencoded({extended: true}));
//app.use(cookieParser());
app.set(`db`,mongo);
app.set(`id`,ObjectID);
app.set(`event`,eventEmitter);
// DO all auth functions
let user_auth=require(`../auth/user_auth`);
n=new Date().toUTCString();
app.get("/",function (req,res) {
        res.send(`Hello rld`)
});
app.all('/signup',user_auth.sign_up);
app.all(`/login`,user_auth.login);
app.all('/google_auth',user_auth.google_auth);
app.all('/facebook_auth',user_auth.facebook);
// require auth to proceed
require(`../classes/jwt-check`)(app);
// tests module
require(`../tests/init`)(app);
// jobs module
require(`../jobs/init`)(app);
// gamification module
require(`../gamification/init`)(app);
app.use(function (err,req,res,next) {
        console.log(`ERROR`,arguments);
});
app.listen(
    process.env.PORT || 3000,
    () =>
        console.log(
            `Example app listening on port ${process.env.PORT || 3000} !`
        )
);
process.on("uncaughtException",function () {
        console.log(arguments);
});
process.on("uncaughtRejection",function () {
        console.log(arguments);
})

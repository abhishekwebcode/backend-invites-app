console.clear();
let start_date = new Date().toDateString();
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
// view engine setup
//app.use(cookieParser());
app.set(`db`,mongo);
app.set(`id`,ObjectID);
app.set(`event`,eventEmitter);
// DO all auth functions
let user_auth=require(`../auth/user_auth`);
app.use(function (err,req,res,next) {
        console.log(arguments);
});
app.get("/",function (req,res) {
        res.send(`Hello World ${start_date}`)
});
app.post("*",function (req,res,next) {
        console.log(arguments);
        next();
});
app.post('/signup',user_auth.sign_up);
app.post(`/login`,user_auth.login);
app.post('/google_auth',user_auth.google_auth);
app.post('/facebook_auth',user_auth.facebook);
app.use(formidableMiddleware());
app.use(express.urlencoded({extended: true}));
// require auth to proceed
require(`../classes/jwt-check`)(app);
// tests module
require(`../tests/init`)(app);
// jobs module
require(`../jobs/init`)(app);
// gamification module
require(`../gamification/init`)(app);
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
});

console.clear();
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
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(formidableMiddleware())
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set(`db`,mongo);
app.set(`id`,ObjectID);
app.set(`event`,eventEmitter);
// DO all auth functions
let user_auth=require(`../auth/user_auth`);
app.post('/signup',user_auth.sign_up);
app.post(`/login`,user_auth.login);
app.post('/google_auth',user_auth.google_auth);
app.post('/facebook_auth',user_auth.facebook);
// require auth to proceed
const bearerToken = require('express-bearer-token');
app.use(bearerToken());
app.all("*",async function (req, res, next) {
    //let meta = require(`../auth/jwt/verify`)(res.token, res.email, res);
    let meta = await (require("../auth/jwt/jwt").getPayloadFromToken(req.token));
    if (!meta) { res.end() ; return ; }
    req.User = meta;
    req.email = meta.email;
    next();
});

// tests module
require(`../tests/init`)(app);


app.listen(
    3000,
    () =>
        console.log(
            `Example app listening on port 3000 !`
        )
);

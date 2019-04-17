
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const formidableMiddleware = require('express-formidable');

const events = require(`events`);
const eventEmitter = new events.EventEmitter();
const mongo = require("../mongodb/mongodb");
console.clear();
console.dir(mongo)
var getDB=mongo;
process.env.NODE_ENV = 'production';
const express = require('express');
const app = express();
app.use(function(req, res, next) {
    console.dir(res);
    next();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(formidableMiddleware())

const fs = require(`fs`);
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(logger('dev',{stream:accessLogStream}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set("db",mongo);
app.use(function (err,request,response,next) {
    if(err) response.end();
    // do filter fields
});

// DO all auth functions
let user_auth=require(`../auth/user_auth`);
app.post('/signup',user_auth.sign_up);
app.post(`/login`,user_auth.login);
app.post('/google_auth',user_auth.google_auth);
app.post('/facebook_auth',user_auth.facebook);
// require auth to proceed
const bearerToken = require('express-bearer-token');
app.use(bearerToken());
app.use(async function (req, res, next) {
    //let meta = require(`../auth/jwt/verify`)(res.token, res.email, res);
    let meta = await (require("../auth/jwt/jwt").getPayloadFromToken(req.token));
    if (!meta) { res.end() ; return ; }
    req.User = meta;
    req.email = meta.email;
    next();
});

// tests module
require(`./src/tests/init`)(app);
app.post('/tests/meta',async function (request,response) {
    let type = request.fields.test_type ;
    let test_meta = await request.app.get("db").collection(`tests_meta`).findOne({test_name:type}).limit(1).toArray();
    res.json({success:true,result:test_meta});
});
app.post(`/tests/BMTI/getQuestions`,async function (req,res) {
   let questions = await req.app.get("db").collection(`BMTI`).find({}).limit(20).toArray();
   res.json({success:true,questions})
});
app.post(`/tests/BMTI/submitTest`,async function(req,res) {

});

app.listen(
    3000,
    () =>
        console.log(
            `Example app listening on port !`
        )
)

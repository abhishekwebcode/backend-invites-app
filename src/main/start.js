
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
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(formidableMiddleware())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set("db",mongo);

// DO all auth functions
app.post(`/signup`,require(`../auth/user_auth`).sign_up);

// require auth to proceed
const bearerToken = require('express-bearer-token');
app.use(bearerToken());
app.use(async function (req, res, next) {
    //let meta = require(`../auth/jwt/verify`)(res.token, res.email, res);
    let meta = await (require("../auth/jwt/jwt").getPayloadFromToken(req.token));
    if (!meta) { res.end() ; return ; }
    req.User = meta;
    next();
});

app.all('*', async (req, res, next) => {
    console.dir(req.User);
    res.json(req.User);
    next();
})

app.all('*', (req, res) => {
    res.send(`I am here`);
    console.log(res.User)
})

app.listen(
    3000,
    () =>
        console.log(
            `Example app listening on port !`
        )
)

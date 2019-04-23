module.exports=function (app) {
    //TODO Bypassed JWT AUTH
    return;
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
};
const bearerToken = require('express-bearer-token');
module.exports=function (app) {
    app.use(bearerToken());
    app.all("*", async function (req, res, next) {
        try {
            //let meta = require(`../auth/jwt/verify`)(res.token, res.email, res);
            console.log("token is", req.token);
            let meta = await (require("../auth/jwt/jwt").getPayloadFromToken(req.token));
            console.dir(meta);
            if (!meta) {
                res.json({success: false, loggedOutError:true});
                res.end();
                return;
            }
            req.User = meta;
            req.email = meta.email;
            next();
        } catch (e) {
            console.error(e);
            res.json({success:false,loggedOutError:true})
        }
    });
};
var GoogleSignIn = require('google-sign-in');
var project = new GoogleSignIn.Project(`38743765127-ir1npuoqh58jnep2u1iap8348jllthl2.apps.googleusercontent.com`,`38743765127-srj09uavqg75vsbsj8lbrbm0aotuvi1u.apps.googleusercontent.com`);

var google_auth=async function (db,request,response) {
    try {
        let googleSignInResult = await project.verifyToken(request.fields.google_token);
        let userObjectGoogle = {
            email:googleSignInResult.email,
            email_verified:googleSignInResult.email_verified,
            name:googleSignInResult.name,
            picture:googleSignInResult.picture,
            given_name:googleSignInResult.given_name,
            family_name:googleSignInResult.family_name,
            locale:googleSignInResult.locale
        };
        let db1 = await db();
        let checkExisting = await db.collection(`users`).find({email:userObjectGoogle.email}).limit(1).toArray();
        if (checkExisting.length===0) {
            await googleSignUp(db,request,response,userObjectGoogle);
        }
        else {
            await googleSignIn(db,request,response,userObjectGoogle);
        }
    }
    catch (e) {
        response.json({success:false,CODE:e.message});
        response.end();
        return ;
    }
};
var googleSignUp = async function (db,request,response,new_one) {
    let insResult = await request.app.get("db")().collection(`users`).insertOne({
        google_meta:new_one,
        email:new_one.email,
        password:false,
    });
    if (insResult.insertedCount!==1) {
        response.json({success:false,CODE:"DB_ERROR"});
    }
    let jwt_token=await (require("../auth/jwt/jwt")).generateToken({email:new_one.email,time:Date.now()});
    response.json({
        success:true,
        token:jwt_token
    });
};
var googleSignIn = async function (db,request,response,existing_one) {
    let jwt_token=await (require("../auth/jwt/jwt")).generateToken({email:existing_one.email,time:Date.now()});
    response.json({
        success:true,
        token:jwt_token
    });
};
var userLogIn = async function (db,request,response) {

};
var userSignUp = async function (db,request,response) {

};

module.exports.sign_up=userSignUp;

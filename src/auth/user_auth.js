var GoogleSignIn = require('google-sign-in');
var project = new GoogleSignIn.Project(`38743765127-elsf2nslqrmd5ce9nak3rfc2r3rn5s9s.apps.googleusercontent.com`);
const { FacebookSignIn } = require('@coolgk/facebook-sign-in');
const facebookSignIn = new FacebookSignIn({
    clientId: '405278700287006',
    secret: '091015732c5ff74759b137843f3f17c9'
});

var google_auth=async function (request,response) {
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
        let checkExisting = await request.app.get(`db`)().collection(`users`).find({email:userObjectGoogle.email}).limit(1).toArray();
        if (checkExisting.length===0) {
            await googleSignUp(request,response,userObjectGoogle);
        }
        else {
            await googleSignIn(request,response,userObjectGoogle);
        }
    }
    catch (e) {
        response.json({success:false,CODE:e.message});
        response.end();
        return ;
    }
};
var googleSignUp = async function (request,response,new_one) {
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
var googleSignIn = async function (request,response,existing_one) {
    let jwt_token=await (require("../auth/jwt/jwt")).generateToken({email:existing_one.email,time:Date.now()});
    response.json({
        success:true,
        token:jwt_token
    });
};
var userLogIn = async function (request,response) {
    let username=request.fields.username;
    let password=request.fields.password;
    let res = await request.app.get('db')().collection('users').find({
        $or: [{ username }, { email:username }],
        password
    }).limit(1).toArray();
    if (res.length===0) {
        response.json({success:false,CODE:`USER_DOESNT_EXIST`});
    }
    else {
        let token=await (require("../auth/jwt/jwt")).generateToken({email:res[0].email,time:Date.now()});
        response.json({success:true,CODE:`USER_SUCCESS`,token});
    }
};
var userSignUp = async function (request,response) {
    let email=request.fields.email;
    let name=request.fields.name;
    let password=request.fields.password;
    let passwordConfirm=request.fields.passwordConfirm;
    if (password!==passwordConfirm) {
        response.json({
            success:false,
            message:"Passwords do not match"
        });
        return;
    }
    if (!email=="" || password=="" || name="" || passwordConfirm=="")) {
        response.json({success:false,message:` Please Fill all the fields correctly`});
        return;
    }
    else {
        console.log(request.fields, "FIELDS");
        let res = await request.app.get("db")().collection(`users`).find({email}).limit(1).toArray();
        if (res.length === 0) {
            let rr = await request.app.get("db")().collection(`users`).insertOne({
                email,
                name,
                password,
                email_verified: false
            });
            let token = await (require("../auth/jwt/jwt")).generateToken({email, time: Date.now()});
            if (rr.insertedCount === 1) {
                response.json({success: true, CODE: `EMAIL_VERIFICATION_PENDING`, token: token})
            } else {
                response.json({success: false, CODE: `BACKEND_ERROR`,message:"Somethings seems wrong! Let us know via feedback on the app store"})
            }
        } else {
            if (res[0].email_verified || true) {
                response.json({success: false, CODE: `ALREADY_SIGNED_UP`,message:"You are already signed up"});
                response.end();
            } else {
                response.json({success: false, CODE: `EMAIL_VERIFICATION_PENDING`,message:"You are already signed up"});
                response.end();
            }
        }
    }
};
async function facebook(request,response) {
    console.log(arguments);
    let user = await facebookSignIn.verify(request.fields.facebook_token);
    if (!user) {
        response.json({success:false,CODE:`FACEBOOK_AUTH_FAILED`})
    }
    else {
        let email = user.email;
        if (email!==undefined && email!== null && email.indexOf('@')>-1) {
            let resfb=await request.app.get('db')().collection(`users`).find({email}).limit(1).toArray();
            if (resfb.length==0) {
                await request.app.get('db')().collection(`users`).insertOne({
                    username:false,
                    email,
                    facebook_meta:user,
                    password:false
                });
                let jwt_token=await (require("../auth/jwt/jwt")).generateToken({email,time:Date.now()});
                response.json({
                    success:true,
                    token:jwt_token
                });
            }
            else {
                let jwt_token=await (require("../auth/jwt/jwt")).generateToken({email:email,time:Date.now()});
                response.json({
                    success:true,
                    token:jwt_token
                });
            }
        } else {
            response.json({success:false,CODE:`EMAIL_DENIED`})
        }
    }
};
module.exports.sign_up=userSignUp;
module.exports.login=userLogIn;
module.exports.google_auth=google_auth;
module.exports.facebook=facebook;

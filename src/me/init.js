module.exports=function (app) {
    app.all(`/me/profile`,async function (request,response) {
        let email = request.email;
        console.log(email);
        let res=await request.app.get("db")().collection(`users`).find({email}).project({email:1,username:1}).limit(1).toArray();
        response.json({
            success:true,
            data:(res.length==0)?[{email:"Not found",username:"..."}]:res[0]
        })
    });
}
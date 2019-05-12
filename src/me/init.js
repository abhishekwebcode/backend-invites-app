module.exports=function (app) {
    app.all(`/me`,async function (request,response) {
        let email = request.email;
        console.log(email);
        let res=await request.app.get("db")().collection(`users`).find({email}).limit(1).toArray();
        response.json({
            success:true,
            data:res
        })
    });
}
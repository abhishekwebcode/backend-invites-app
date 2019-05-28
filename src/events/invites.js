module.exports=function (app) {
    app.post(`/invites/list`,async function (request,response) {
        let db = request.app.get(`db`)();
        console.dir(`inInviesliSt`);
        console.dir(db);
        let id = await db.collection(`users`).find({email:request.User.email}).limit(1).toArray();
        let _id= id[0]._id;
        let userID=request.app.get(`id`)(_id);
        let invites =await db.collection(`events`).find({
            users:{
                $in:[
                    userID
                ]
            }
        },{
           _id:1,childName:1,date:1
        }).sort({date:-1}).skip(request.fields.offset).limit(10).toArray();
        response.json({
            success:true,invites
        })
    });
};
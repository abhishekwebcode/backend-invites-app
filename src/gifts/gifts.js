module.exports=function (app) {
    app.post(`gifts/list`,async function (request,response) {
        let gifts = await app.get(`db`)().collection(`gifts`).find({
            created_by:request.email,eventId:request.fields.eventId
        }).project({_id:1,todo:1,done:1,date_created:1}).sort({gift:1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        response.json({
            success:true,gifts
        })
        return ;
    })
    app.post(`gifts/add`,async function (request,response) {
        let gift = request.fields.todo;
        let eventId = request.fields.eventId;
        let todoIns = await app.get(`db`)().collection(`gifts`).insertOne({
            gift,eventId,created_by:request.email,date_created:Date.now(),selected:false,selected_by_id:null
        });
        if (todoIns.insertedCount==1) {response.json({success: true})}
        else {response.json({success: false,message:`Error creating your task`});}
        return ;
    })
};
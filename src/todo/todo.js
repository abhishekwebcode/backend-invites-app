module.exports=function (app) {
    app.post(`/todo/list`,async function (request,response) {
        let todos = await app.get(`db`)().collection(`todo`).find({
            created_by:request.email,eventId:request.fields.eventId
        }).project({_id:1}).sort({}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        response.json({
            success:true,todos
        })
    });
    app.post(`/todo/create`,async function (request,response) {
        let todo = request.fields.todo;
        let eventId = request.fields.eventId;
        let todoIns = await app.get(`db`)().collection(`events`).insertOne({todo,eventId,created_by:request.email,date_created:Date.now()});
        if (todoIns.insertedCount==1) {response.json({success: true})}
        else {response.json({success: false,message:`Error creating your task`});}
        return ;
    });
};
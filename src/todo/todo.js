module.exports=function (app) {
    app.post(`/todos/list`,async function (request,response) {
        console.log(arguments);
        let todos = await app.get(`db`)().collection(`todo`).find({
            created_by:request.email,eventId:request.fields.eventId
        }).project({_id:1,todo:1,done:1,date_created:1}).sort({}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        response.json({
            success:true,todos
        })
    });
    app.post(`/todos/update`,async function (request,response) {
        let todo = request.fields.item;
        let status = request.fields.status;
        let result=await app.get(`db`)().collection(`todo`).update(
            {
                _id:app.get(`id`)(todo)
            },{
                done:(status === "true")
            });
        console.dir(result);
    });
    app.post(`/todos/create`,async function (request,response) {
        let todo = request.fields.todo;
        let eventId = request.fields.eventId;
        let todoIns = await app.get(`db`)().collection(`todo`).insertOne({
            todo,eventId,created_by:request.email,date_created:Date.now(),done:false
        });
        if (todoIns.insertedCount==1) {response.json({success: true})}
        else {response.json({success: false,message:`Error creating your task`});}
        return ;
    });
};
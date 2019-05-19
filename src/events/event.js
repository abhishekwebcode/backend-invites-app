
module.exports=function (app) {
    app.post(`/events/list`,async function (request,response) {
        let events = await app.get(`db`)().collection(`events`).find({
            created_by:request.email,
        }).skip(request.fields.offset||10).limit(10);
        response.json({success:true,events:events});
    });
    app.post(`/events/add`,async function(request,response) {
        console.log(arguments);
        let event=JSON.parse(request.fields.event);
        console.log(event);
        let events = await app.get(`db`)().collection(`events`).insertOne(
            {...event,created_by:request.email,date_created:Date.now()}
        );
        console.log(events);
        response.json({success: true})
    });
};
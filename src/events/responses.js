module.exports=function (app) {
    app.post(`/events/listResponses`,async function(request,response) {
        let db = request.app.get(`db`)();
        let eventIdObject = request.app.get(`id`)(request.fields.eventId);
        let responses = await db
            .collection(`responses`)
            .find({
                eventId : eventIdObject,
            })
            .forEach(e=>{})
            .project({
                _id:1,
                registered:1,
                intention:1,
                email:1
            })
            .sort({date_created: -1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        response.json({
            success : true,
            responses
        });
        return ;
    });
};
module.exports=function (app) {
    app.post(`/events/listResponses`,async function(request,response) {
        let db = request.app.get(`db`)();
        let eventIdObject = request.app.get(`id`)(request.fields.eventId);
        let responses = await db
            .collection(`responses`)
            .find({
                eventId : eventIdObject,
            })
            .project({
                _id:1,
                registered:1,
                intention:1,
                email:1
            })
            .sort({date_created: -1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        for (let i=0;i<responses.length;i++) {
            try {
                if (responses[i].registered !== true) continue;
                let email = responses[i].email;
                delete responses[i].email;
                responses[i].name=(await db.collection(`users`).findOne({email}, {projection: {name: 1, _id: 0}})).name;
            } catch (e) {
                console.error(e);
            }
        }
        response.json({
            success : true,
            responses
        });
        return ;
    });
};

module.exports=function (app) {
    app.post(`/events/list`,async function (request,response) {
        console.log(arguments);
        let events = await app.get(`db`)().collection(`events`).find({
            created_by:request.email,
        }).project({_id:1,date:1,childName:1,theme:1}).sort({date:-1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        console.dir(events);
        let send=[];
        events.forEach(item=>{
            send.push({
                id:item._id,
                name:item.childName,
                theme:item.theme,
                date:item.date.getTime()
            })
        });
        response.json({success:true,events:send});
    });

    app.post(`/events/infodetail`,async function (request,response) {
        let db = request.app.get(`db`)();
        console.log(request.fields);
        let eventIDObj = request.app.get(`id`)(request.fields.eventId);
        let event = db.collection(`events`).find({
            _id:eventIDObj
        }).project({
            timeEnd: 1,
            zipCode: 1,
            country: 1,
            isSpecialTheme: 1,
            city: 1,
            timeStart: 1,
            date: 1,
            street: 1,
            childName: 1,
            district: 1,
            otherAddress: 1,
            theme: 1,
            created_by: 1
        }).toArray();
       response.json({
           success:true,
           event
       })
    });

};
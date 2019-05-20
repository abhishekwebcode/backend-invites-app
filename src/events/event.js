
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


};

module.exports=function (app) {
    app.post(`/events/list`,async function (request,response) {
        console.log(arguments);
        let events = await app.get(`db`)().collection(`events`).find({
            created_by:request.email,
        }).project({_id:1,date:1,childName:1,theme:1}).sort({date:-1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        let send=[];
        events.forEach(item=>{
            send.append({
                id:item._id,
                name:item.childName,
                theme:item.theme,
                date:item.getTime()
            })
        })
        response.json({success:true,events:events});
    });
    app.post(`/events/add`,async function(request,response) {
        console.log(arguments);
        let event=JSON.parse(request.fields.event);
        event["date"]=new Date(parseInt(event["date"]));
        event["isSpecialTheme"]=(event["isSpecialTheme"]=="true"?true:false);
        event["guestSee"]=(event["guestSee"]=="true"?true:false);
        console.log(event);
        let events = await app.get(`db`)().collection(`events`).insertOne(
            {...event,created_by:request.email,date_created:Date.now()}
        );
        if (events.insertedCount==1) {
            response.json({success: true})
        }
        else
            {response.json({success: false,message:`Error creating your party`})}
        return ;
    });

};
module.exports=function (app) {
    app.post(`/event/getAttendees`,async function(request,response,next) {
        let db = request.app.get(`db`)();
        let eventIDObject = request.app.get(`id`)(request.fields.eventId);
        let eventDetails = await db.collection(`events`).find({_id:eventIDObject}).project({users:1,unRegisteredNumbersInternational:1}).toArray();
        //console.dir(eventDetails);
        console.dir(eventIDObject);
        console.dir(eventDetails);
        let numbers = eventDetails.unRegisteredNumbersInternational;
        console.log(eventDetails.users,`array $In`);
        let users = await db.collection(`users`).find({
            _id: { $in : eventDetails.users }
        }).project({name:1,"phone.number":1}).toArray();
        let usersFinal=users;
        let numbersFinal=numbers;
        if (users.length>0) {
            usersFinal[0].changeToUser=true;
        }
        if (numbersFinal.length>0) {
            numbersFinal[0].changeToNumber=true;
        }
        response.json({
            success:true,
            data : {
                users:usersFinal,
                numbers:numbersFinal
            }
        })
        return ;
    })
};
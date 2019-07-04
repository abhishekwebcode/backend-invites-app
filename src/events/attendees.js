module.exports=function (app) {
    app.post(`/event/getAttendees`,async function(request,response,next) {
        let db = request.app.get(`db`)();
        let eventIDObject = request.app.get(`id`)(request.fields.eventId);
        let eventDetails = await db.collection(`events`).find({_id:eventIDObject}).project({users:1,unRegisteredNumbersInternational:1}).limit(1).toArray();
        eventDetails=eventDetails[0];
        //console.log(eventDetails);
        console.log(eventIDObject);
        console.log(eventDetails);
        let numbers = eventDetails.unRegisteredNumbersInternational;
        console.log(eventDetails.users,`array $In`);
        let users = await db.collection(`users`).find({
            _id: { $in : eventDetails.users }
        }).project({name:1,"phone.number":1}).toArray();
        response.json({
            success:true,
            data : {
                users:users,
                numbers:numbers
            }
        })
        return ;
    })
};

async function temPtoken(token,eventIdObject,fcm,sends,OwnerName,childname) {
    let message = {
        to: token,
        collapse_key: 'New Invite',
        data: {
            type:`NEW_INVITE`,
            eventId:eventIdObject.toString(),
            Date:Date.now(),
            OwnerName,
            Action:`INVITE`,
            childname: childname
        }
    };
    //console.log(`FOR DEBUG`,fcm,message);
    let seObj=fcm(message).then(console.log).catch(console.log);
    sends.push(seObj);
    //console.log(seObj)
    return ;
}
async function sendPush(registeredUsers,ids,db,eventIdObject,app,OwnerName,childName) {
    let allTokens=[];
    let fcm = app.get(`FCM`);
    registeredUsers.forEach(e=>{
        try {
            allTokens.push(...(e.FCM_Tokens));
        } catch (e) {
            console.warn(`ERROR`,e);
        }
    });
    let sends=[];
    for (let i = 0; i < allTokens.length ; i++) {
        let token = allTokens[i];
        temPtoken(token,eventIdObject,fcm,sends,OwnerName,childName).catch(console.log);
    }
    return 1;
    /*db.collection(`users`).updateMany(
        {_id:{$in:ids}},
        {
            $push:{
                invited:app.get(`id`)(eventIdObject)
            }
        },
    )*/
}
module.exports = function (app) {
    const asyncer = app.get(`wrap`);
    app.post(`/events/overview`, asyncer(async function (request, response) {
        try {
            //console.log(arguments);
            let db = request.app.get(`db`)();
            let eventIDObj = (request.app.get(`id`))(request.fields.eventId);
            let events = await db.collection(`events`).find({
                _id: eventIDObj
            }).project({
                users: 1,
                date: 1,
                timeStart: 1
            }).toArray();
            let users = events[0].users;
            let totalInvited = users.length;
            let going = await db.collection(`responses`).find({
                intention: true,
                eventID: eventIDObj
            }).count();
            let notGoing = await db.collection(`responses`).find({
                intention: false,
                eventID: eventIDObj
            }).count();
            response.json({
                success: true,
                totalInvited, going, notGoing, date:events[0].date, time: events[0].timeStart
            });
            response.end();
            return;
        } catch (e) {
            //console.error(e);
            response.json({success:false})
            return ;
        }
    }));
    app.post(`/events/resendNotifications`, asyncer(async function (request, response) {
        //console.log(arguments);
        let db = request.app.get(`db`)();
        let eventIDObj = (request.app.get(`id`))(request.fields.eventId);
        let events = await db.collection(`events`).find({
            _id:eventIDObj
        }).project({
            users:1,
            unRegisteredNumbersInternational:1
        }).toArray();
        events=events[0];
        let users = events.users;
        let userObjects=await db.collection(`users`).find({_id:{$in:users}}).project({email:1}).toArray();
        let emails=[];
        for (let i = 0; i < userObjects.length ; i++) {
            emails.push(userObjects[i].email);
        }
        let returned = await db.collection(`responses`).find({eventID:eventIDObj,email:{$in:emails}}).toArray();
        for (let i = 0; i < returned.length ; i++) {
            //TODO redo this notification section
        }
        //sendPush(users,usersIdsobjs,request.app.get(`db`)(),events.insertedId,app,OwnerName,event.childName).then(()=>{}).catch(()=>{});
        let numbers = events.unRegisteredNumbersInternational;
        let sms_invite_link=request.app.get(`invite_link`);
        response.json({
            success:true,
            sms_invite_link,
            send_sms_datas:numbers.join(`;`),
            send_sms:numbers.length!==0
        });
        response.end();
    }));
}
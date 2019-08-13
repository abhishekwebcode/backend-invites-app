async function notifyUnResponded(event,DB,email) {
    let eventID=event._id;
    let reRemindTokens=[];
    console.dir(event);
    for (let i = 0; i < event.users; i++) {
        let currentUser = event.users[i];
        console.dir(currentUser);
        let currentUserObject = await DB.collection(`users`).findOne({_id:currentUser});
        console.dir(currentUserObject);
        if (currentUserObject===null) continue;
        let response = await DB.collection(`responses`).findOne({eventID,email:currentUserObject.email});
        console.dir(response);
        if (response==null) {
            reRemindTokens.push(currentUserObject.FCM_Tokens[0]);
        }
        else continue;
    }
    console.dir(reRemindTokens);

}
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
    let seObj=fcm(message).then(()=>{}).catch(()=>{});
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
        temPtoken(token,eventIdObject,fcm,sends,OwnerName,childName).catch(()=>{});
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
        let emailPointer = JSON.parse(JSON.stringify(request.email));
        notifyUnResponded(events,db,emailPointer).then(()=>{}).catch((e)=>{console.error(e)});
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
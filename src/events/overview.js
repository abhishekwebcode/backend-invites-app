async function notifyUnResponded(event, DB, email, FCM) {
    let eventID = event._id;
    let reReminderTokens = [];
    for (let i = 0; i < event.users.length; i++) {
        let currentUser = event.users[i];
        let currentUserObject = await DB.collection(`users`).findOne({_id: currentUser});
        if (currentUserObject === null) continue;
        let response = await DB.collection(`responses`).findOne({eventID, email: currentUserObject.email});
        if (response == null) {
            reReminderTokens.push(currentUserObject.FCM_Tokens[0]);
        } else continue;
    }
    let owner = await DB.collection(`users`).findOne({email});
    let message = {
        to: token,
        collapse_key: 'New Invite',
        data: {
            type: `NEW_INVITE`,
            eventId: eventID.toString(),
            Date: Date.now(),
            OwnerName:owner.name,
            Action: `INVITE`,
            childname: event.childName
        }
    };
    message["registration_ids"]=reReminderTokens;
    Promise.resolve(
        FCM(message)
    ).then(() => {}).catch((e) => {
        console.error(e)
    });
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
                totalInvited, going, notGoing, date: events[0].date, time: events[0].timeStart
            });
            response.end();
            return;
        } catch (e) {
            //console.error(e);
            response.json({success: false})
            return;
        }
    }));
    app.post(`/events/resendNotifications`, asyncer(async function (request, response) {
        //console.log(arguments);
        let db = request.app.get(`db`)();
        let eventIDObj = (request.app.get(`id`))(request.fields.eventId);
        let events = await db.collection(`events`).find({
            _id: eventIDObj
        }).project({
            childName:1,
            users: 1,
            unRegisteredNumbersInternational: 1
        }).toArray();
        events = events[0];
        let emailPointer = JSON.parse(JSON.stringify(request.email));
        let fcm = app.get(`FCM`);
        notifyUnResponded(events, db, emailPointer, fcm).then(() => {
        }).catch((e) => {
            console.error(e)
        });
        let numbers = events.unRegisteredNumbersInternational;
        let sms_invite_link = request.app.get(`invite_link`);
        response.json({
            success: true,
            sms_invite_link,
            send_sms_datas: numbers.join(`;`),
            send_sms: numbers.length !== 0
        });
        response.end();
    }));
}
var sendPush = async function (fcm, tokens, eventID, OwnerName, childName) {
    let payload = {
        collapse_key: 'New Invite',
        data: {
            type: `CHANGE_EVENT`,
            eventId: eventID.toString(),
            Date: Date.now(),
            OwnerName: OwnerName,
            Action: `INVITE`,
            childname: childName

        }
    };
    payload["registration_ids"] = tokens;
   //console.log(payload, fcm);
    fcm(payload).then(()=> {
        //console.log
    }).catch(()=>{
        //console.log
    });
    return ;
};

module.exports = function (app) {
    const asyncer = app.get(`wrap`);
    app.post(`/events/list`, asyncer(async function (request, response) {
       //console.log(arguments);
        let events = await app.get(`db`)().collection(`events`).find({
            created_by: request.email,
        }).project({
            _id: 1,
            date: 1,
            childName: 1,
            theme: 1
        }).sort({date_created: 1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
       //console.log(events);
        let send = [];
        events.forEach(item => {
            send.push({
                id: item._id,
                name: item.childName,
                theme: item.theme,
                date: item.date.getTime()
            })
        });
        response.json({success: true, events: send});
        return ;
    }));

    app.post(`/events/infodetail`,asyncer( async function (request, response) {
        let db = request.app.get(`db`)();
        let eventIDObj = (request.app.get(`id`))(request.fields.eventId);
        let event = await db
            .collection(`events`)
            .find({
                _id: eventIDObj
            })
            .project({
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
                created_by: 1,
                guestSee: 1,
                latitude: 1,
                longitude: 1
            })
            .limit(1)
            .toArray();
        event = event[0];
       //console.log(event);
        response.json({
            success: true,
            event
        });
        return ;
    }));

    app.post(`/events/update`,asyncer( async function (request, response) {
        let db = request.app.get(`db`)();
        let eventIDObj = (request.app.get(`id`))(request.fields.eventId);
        let fields = request.fields;
        delete fields.eventId;
        let event = fields;
        event["date"] = new Date(parseInt(event["date"]));
        event["isSpecialTheme"] = (event["isSpecialTheme"] === "true");
        event["guestSee"] = (event["guestSee"] === "true");
        let update = await db.collection(`events`).update({_id: eventIDObj}, {$set: event}, {});
       //console.log(update);

        let IDsObj = await db.collection(`events`)
            .find({_id: eventIDObj})
            .project({users: 1, childName: 1, created_by: 1}).limit(1).toArray();
        let Ids = IDsObj[0].users;
        let tokens = await db.collection(`users`).find({
            _id: {$in: Ids}
        }).project({FCM_Tokens: 1}).toArray();

        let AllTokens = [];
        tokens.forEach(user => {
            try {
                AllTokens.push(...user.FCM_Tokens);
               //console.log(`IUHf`, user), AllTokens;
            } catch (e) {
                console.error(e, `ErRROR`);
            }
        });

        let childName = IDsObj[0].childName;
        let emailOwner = IDsObj[0].created_by;
        let users = await db.collection(`users`).find({email: emailOwner}).limit(1).toArray();
        let ownerName = users[0].name;
       //console.log(`OWNERNAME`, users);
        sendPush(request.app.get(`FCM`), AllTokens, eventIDObj, ownerName, childName).then(()=>{
            //console.log(e);
        }).catch(()=>{
            //console.log(e);
        });
        response.json({
            success: (
                update.result.ok === 1
            )
        });
        return;
    }));

    app.post(`/events/delete`, asyncer(async function (request, response) {
        let db = request.app.get(`db`)();
        let eventIDObj = (request.app.get(`id`))(request.fields.eventId);
        let RESPONSE_DB = await db.collection(`events`).remove({_id: eventIDObj});
        if (RESPONSE_DB.result.n === 1) {
            response.json({success: true});
        } else {
            response.json({success: false});
        }
        return;
    }));


};
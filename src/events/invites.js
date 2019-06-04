module.exports = function (app) {
    app.post(`/invites/list`, async function (request, response) {
        console.dir(arguments);
        let db = request.app.get(`db`)();
        console.dir(`inInviesliSt`);
        console.dir(db);
        let id = await db.collection(`users`).find({email: request.User.email}).limit(1).toArray();
        let _id = id[0]._id;
        let userID = request.app.get(`id`)(_id);
        let invites = await db.collection(`events`).find({
            users: {
                $in: [
                    userID
                ]
            }
        }).project({
            _id: 1, childName: 1, date: 1
        }).sort({date: -1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        response.json({
            success: true, invites
        })
    });
    app.post(`/invites/info`, async function (request, response) {
        let eventID = request.fields.eventId;
        let eventIDOBJECT = request.app.get(`id`)(eventID);
        console.log(arguments);
        let eventINFO = await request.app.get(`db`)().collection(`events`).find({
            _id: eventIDOBJECT
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
        if (eventINFO.length === 0) {
            response.json({success: false, message: "Invite does not exist"});
            return;
        } else {
            let email = eventINFO[0].created_by;
            let userInfo = await request.app.get(`db`)().collection(`users`).find({email: email}).toArray();
            console.dir({
                success: true,
                invite: eventINFO[0],
                owner: userInfo[0]
            });
            response.json({
                success: true,
                invite: eventINFO[0],
                owner: userInfo[0]
            });
            return;
        }
    });
    app.post(`/invites/reject`, async function (request, response) {
        let db = request.app.get(`db`)();
        let eventID = request.app.get(`id`)(request.fields.eventId);
        await db.collection(`responses`).remove({
            email:request.User.email,
            eventID,
            registered:true
        });

        let ins = await db.collection(`responses`).insertOne({
            registered:true,
            intention:false,
            email:request.User.email,
            eventID,
            date_created:Date.now()
        });
        if (ins.result.ok===1) {
            response.json({
                success: true
            })
        } else {
            response.json({success:false})
        }
        return ;
    });

    app.post(`/invites/accept`, async function (request, response) {
        let db = request.app.get(`db`)();
        let eventID = request.app.get(`id`)(request.fields.eventId);
        await db.collection(`responses`).remove({
            email:request.User.email,
            eventID,
            registered:true
        });
        let ins = await db.collection(`responses`).insertOne({
            registered:true,
            intention:true,
            email:request.User.email,
            eventID,
            allergy1:request.fields.allergy1,
            allergy2:request.fields.allergy2,
            allergy3:request.fields.allergy3,
            isAllergy:request.fields.isAllergy,
            date_created:Date.now()
        });
        if (ins.result.ok===1) {
            let gifts = await db.collection(`gifts`).find({
                eventId:eventID,
            }).toArray();
            if (gifts.length!==0) {
                response.json({
                    success: true,
                    chooseGifts:true,
                    gifts
                });
            }
            else {
                response.json({
                    success: true
                });
            }
        } else {
            response.json({success:false})
        }
        return ;
    });

    app.post(`/invites/check`, async function (request, response) {
        let db = request.app.get(`db`)();
        let eventID = request.app.get(`id`)(request.fields.eventId);
        let check = await db.collection(`responses`).findOne({
            email:request.User.email,
            eventID,
            registered: true,
        })
        console.log(`CHECKING EXISTING INVITE`);
        console.dir(check);
        if (check===null) {
            response.json({
                success:true,
                sent:false
            })
        }
        else {
            response.json({
                success:true,
                sent:true,
                intention:(check.intention===true?`going`:`not going`)
            })
        }

    });

};
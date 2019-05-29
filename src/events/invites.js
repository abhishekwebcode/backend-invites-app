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
        let ins = db.collection(`responses`).insertOne({
            registered:true,
            intention:false,
            email:request.User.email,
            eventID
        });
        console.dir(ins);
        response.json({
            success:true
        })
    });



};
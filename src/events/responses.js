module.exports = function (app) {
    app.post(`/events/listResponses`, async function (request, response) {
        let db = request.app.get(`db`)();
        let isGuest = Boolean(request.fields.isGuest);
        let eventIdObject = request.app.get(`id`)(request.fields.eventId);
        let responses = await db
            .collection(`responses`)
            .find({
                eventID: eventIdObject,
            })
            .project({
                _id: 1,
                registered: 1,
                intention: 1,
                email: 1,
                date_created: 1,
                isAllergy: (isGuest ? 0 : 1),
                allergy1: (isGuest ? 0 : 1),
                allergy2: (isGuest ? 0 : 1),
                allergy3: (isGuest ? 0 : 1),
                giftSelected:1
            })
            .sort({date_created: -1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        for (let i = 0; i < responses.length; i++) {
            responses[i].isGift=false;
            let objCurrent = responses[i];
            try {
                if (!isGuest) {
                    if (objCurrent.giftSelected && objCurrent.giftSelected!=="" && objCurrent.giftSelected!==false && objCurrent.giftSelected!==null && objCurrent.giftSelected!==undefined) {
                        let giftID = request.app.get(`id`)( objCurrent.giftSelected );
                        let gift = await db.collection(`gifts`).findOne({
                            _id: giftID
                        },{
                            gift:1
                        });
                        //let userGIFTID = request.app.get(`id`)(gift.selected_by_id );
                        //let user_full_name = await db.collection(`users`).findOne({_id:userGIFTID}, {name:1});
                        //let users_final_name = user_full_name.name;
                        responses[i].gift=gift.gift;
                        responses[i].isGift=true;
                    }
                }
            } catch (e) {
                console.error(e);
            }
            try {
                if (responses[i].registered !== true) continue;
                let email = responses[i].email;
                delete responses[i].email;
                responses[i].name = (await db.collection(`users`).findOne({email}, {
                    projection: {
                        name: 1,
                        _id: 0
                    }
                })).name;
            } catch (e) {
                console.error(e);
            }
        }
        response.json({
            success: true,
            responses
        });
        return;
    });
};
var sendPush=async function(fcm,tokens,eventID,gift,childname,ownername) {
    let payload = {
        collapse_key: 'New Invite',
        data: {
            type:`GIFT_ADD`,
            gift,
            eventId:eventID.toString(),
            Date:Date.now(),
            Action:`INVITE`,
            childname:childname,
            OwnerName:ownername
        }
    };
    payload["registration_ids"]=tokens;
    console.log(payload,fcm);
    fcm(payload).then(console.log).catch(console.log);
};

var sendPushGiftSelected = async function(fcm,tokens,eventID,childName,InviteeName) {
    let payload = {
        collapse_key: 'New Invite',
        data: {
            type:`GIFT_SELECTED`,
            Date:Date.now(),
            eventId:eventID.toString(),
            childname:childName,
            InviteeName:InviteeName
        }
    };
    payload["registration_ids"]=tokens;
    console.log(payload,fcm);
    fcm(payload).then(console.log).catch(console.log);
}

module.exports=function (app) {
    app.post(`/gifts/delete`,async function (request,response) {
        let id = request.fields.giftId;
        let giftId = request.app.get(`id`)(id);
        let delete2 = await request.app.get(`db`)().collection(`gifts`).remove({_id:giftId});
        response.json({
            success:delete2.result.n===1
        })
    });
    app.post(`/gifts/getResponseId`,async function (request,response) {
        let eventId = request.app.get(`id`)(request.fields.eventId);
        let eventIDQuery= await request.app.get(`db`)().collection(`responses`).findOne({email:request.User.email,eventID:eventId});
        response.json({
            success:true,responseId:eventIDQuery._id.toString()
        });
        return ;
    });
    app.post(`/gifts/list`,async function (request,response) {
        let eventId = request.app.get(`id`)(request.fields.eventId);
        let gifts = await app.get(`db`)().collection(`gifts`).find({
            created_by:request.email,eventId
        }).project({_id:1,gift:1,selected:1,date_created:1}).sort({gift:1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        response.json({
            success:true,gifts
        })
        return ;
    })
    app.post(`/gifts/listInvitee`,async function(request,response) {
        let event_id_obj = request.app.get(`id`)(request.fields.eventId);
        let email = await app.get(`db`)().collection(`users`).findOne({email:request.email});
        let userIdObj = email._id;
        /**
         * Get selected gifts if there are any
         */
        let giftSelected = await app.get(`db`)().collection(`gifts`).findOne({
            eventId:event_id_obj,
            $or : [
                {
                    selected_by_id:userIdObj
                }
            ]
        },{
            projection:{_id:1,gift:1,selected:1,date_created:1}
        });
        /**
         * Get non-selected gifts
         */
        let gifts = await app.get(`db`)().collection(`gifts`).find({
            eventId:event_id_obj,
            $or : [
                { selected:false }
            ]
        }).project({_id:1,gift:1,selected:1,date_created:1}).sort({gift:1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        response.json({
            success:true,gifts,giftSelected
        });
        return ;
    })
    app.post(`/gifts/add`,async function (request,response) {
        let gift = request.fields.todo;
        let eventId = request.app.get(`id`)(request.fields.eventId);
        let eventMemebers = await app.get(`db`)().collection(`responses`).find({eventID:eventId,intention:true}).project({email:1}).toArray();
        let eventMemebers2 = await app.get(`db`)().collection(`responses`).find({eventID:eventId,intention:true}).project({email:1}).toArray();

        let eventDetails = await app.get(`db`)().collection(`events`).find({_id:eventId}).limit(1).toArray();
        let childName=eventDetails[0].childName;
        let created_by = eventDetails[0].created_by;
        let username =  await app.get(`db`)().collection(`users`).find({email:created_by}).project({name:1}).limit(1).toArray();
        let name = username[0].name;

        let emailsAll=[];
        eventMemebers.forEach(response=>{
            emailsAll.push(response.email);
        });
        console.log(`ALL EMAILS`,emailsAll);
        let tokenss = await app.get(`db`)().collection(`users`).find({email : {$in:emailsAll} }).project({FCM_Tokens:1}).toArray();
        let AllTokens=[];
        tokenss.forEach(user=>{
            try {
                AllTokens.push(...user.FCM_Tokens);
                console.log(`IUHf`,user,AllTokens);
            } catch (e) {
                console.error(e,`ErRROR`);
            }
        });
        sendPush(request.app.get(`FCM`),AllTokens,eventId,gift,childName,name).then(console.log).catch(console.log);

        let todoIns = await app.get(`db`)().collection(`gifts`).insertOne({
            gift,eventId,created_by:request.email,date_created:Date.now(),selected:false,selected_by_id:null
        });
        if (todoIns.insertedCount===1) {response.json({success: true})}
        else {response.json({success: false,message:`Error creating your task`});}
        return ;
    })
    app.post(`/gifts/mark`,async function (request,response) {
        console.log(`MARKING`)
        let db=app.get(`db`)();
        let gift = request.app.get(`id`)(request.fields.todo);
        let eventId = request.app.get(`id`)(request.fields.eventId);
        let responseObj = request.app.get(`id`)(request.fields.responseId);
        let email = await app.get(`db`)().collection(`users`).findOne({email:request.email});
        let userIdObj = email._id;
        let currentUserName  = email.name;
        let giftUnselect = await db.collection(`gifts`).findOneAndUpdate({selected_by_id:userIdObj,eventId:eventId},{
            $set:{selected:false,selected_by_id:false}
        });
        console.log(giftUnselect);
        let eventOwner = await db.collection(`events`).findOne({_id:eventId},{projection:{created_by:1,childName:1}});
        let emailOwner = eventOwner.created_by;
        let childName=eventOwner.childName;
        let user = await db.collection(`users`).findOne({email:emailOwner},{projection:{FCM_Tokens:1}});
        let tokens = user.FCM_Tokens;
        sendPushGiftSelected(request.app.get(`FCM`),tokens,eventId,childName,currentUserName).then(console.log).catch(console.log);

        let gidtUpdate = await db.collection(`gifts`).findOneAndUpdate({_id:gift},{
            $set:{selected:true,selected_by_id:userIdObj}
        });
        console.log(`gidupdate`,gidtUpdate);
        if (gidtUpdate.ok===1) {
            console.log(responseObj);
            let responseUpdate = await db.collection(`responses`).findOneAndUpdate({_id: responseObj}, {
                $set:{giftSelected: gift}
            });
            if (responseUpdate.ok===1) {
                response.json({success: true});
                return ;
            }
        }
        response.json({success:false});
        console.log(`MARKING END`)
        return ;
    })
};
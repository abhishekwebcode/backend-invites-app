module.exports=function (app) {
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
        let gifts = await app.get(`db`)().collection(`gifts`).find({
            eventId:event_id_obj,
            $or : [
                { selected:false },{
                selected_by_id:userIdObj
                }
            ]
        }).project({_id:1,gift:1,selected:1,date_created:1}).sort({gift:1}).skip(parseInt(request.fields.offset)).limit(10).toArray();
        response.json({
            success:true,gifts
        });
        return ;
    })
    app.post(`/gifts/add`,async function (request,response) {
        let gift = request.fields.todo;
        let eventId = request.app.get(`id`)(request.fields.eventId);
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
        let gidtUpdate = await db.collection(`gifts`).findOneAndUpdate({_id:gift},{
            $set:{selected:true,selected_by_id:userIdObj}
        });
        console.log(`gidupdate`,gidtUpdate);
        if (gidtUpdate.ok===1) {
            console.log(responseObj);
            let responseUpdate = await db.collection(`responses`).findOneAndUpdate({_id: responseObj}, {
                $set:{giftSelected: gift4321`987`}
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
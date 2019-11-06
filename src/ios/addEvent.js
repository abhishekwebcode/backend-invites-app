const updateBadges=async function(DB,users) {
    const ids = [];
    users.forEach(e=>{

    });
};
const sendPushIos=async function(FCM,registeredUsers, ids, db, eventIdObject, app, OwnerName, childName) {
    /*
        iOS adaption to notifications
    */
    console.log(`ARGUMENTS adD EVENT IOS`,arguments);
    let iosTokensEnglish=[];
    let iosTokensFrench=[];
    registeredUsers.forEach(e=>{                    
        try {
            if (e.FCM_IOS) {
                if (e.language==="french") {
                    iosTokensFrench.push(e.FCM_IOS);
                } else {
                    iosTokensEnglish.push(e.FCM_IOS);
                }
            }
        } catch (e) {
            console.error(e)
        }
    });
    let message = {
        collapse_key: 'New Invite',
        notification:{
            "sound": "default",
            title:`New invite for ${childName} party`,
            body:`You have been sent RSVP to a party by ${OwnerName}`
            /*
            * May work "click_action": "defaultCategory"
            */
        },
        "content_available": true,
        "mutable_content": true,
        data: {
            "mutable-content" : true,
            type: `NEW_INVITE`,
            eventId: eventIdObject.toString(),
            Date: Date.now(),
            OwnerName:OwnerName,
            Action: `INVITE`,
            childname: childName
        },
    };
    let messageFrench = {
        "sound": "default",
        collapse_key: 'New Invite',
        notification:{
            title:`Nouvelle invitation pour ${childName} fête`,
            body:`RSVP vous a envoyé à une fête par ${OwnerName}`
            /*
            * May work "click_action": "defaultCategory"
            */
        },
        "content_available": true,
        "mutable_content": true,
        data: {
            "mutable-content" : true,
            type: `NEW_INVITE`,
            eventId: eventIdObject.toString(),
            Date: Date.now(),
            OwnerName:OwnerName,
            Action: `INVITE`,
            childname: childName
        },
    };
    message["registration_ids"] = iosTokensEnglish;
    messageFrench["registration_ids"] = iosTokensFrench;
    console.log(messageFrench,message);
    console.log(`sdlifhsodu`);
    console.log(`todebyg notifi`,FCM,messageFrench)
    console.log(`todebyg notifi`,FCM,message)
    FCM(messageFrench).then(e=>{
        console.log(`inside sent`)
        console.log(e);
    }).catch((e)=>{
        console.log(`inside not sent`)
        console.error(e)
    });
    (FCM(messageFrench)).then((e)=>{
        console.log(e)
        console.log(`inside sent`)
    }).catch((e)=>{
        console.error(e)
        console.log(`inside not sent`)
    });
    /*
        Update badges for ios devices
    */
    Promise.resolve(updateBadges(db,registeredUsers)).then(e=>{}).catch(e=>{
        console.error(e)
    });
    return 1;
};  //dsfliohdoifh
module.exports=sendPushIos;
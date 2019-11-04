const addSingle = async function (DB,user) {

};

const addBadge = {
    // actually add badges to invites of users
    addEventBadges:async function (db,users,eventID) {
        console.log(arguments);
        let userUpdate = [];
        users.forEach(user=>{
            if (user.platform==="ios") {
                userUpdate.push(user.ObjectId);
            }
        });
        console.log(`USErs --- add event badge add event`,userUpdate);
        db.collection(`users`).updateMany(
            {
                _id:{$in:userUpdate}
            },
            {
                $addToSet:{
                    "badgesInvites": eventID.toHexString()
                },
                $inc : {
                    "badgesMain.invites" : 1
                }
            }
        ).then(function() {
            console.log(arguments);
        })
         .catch(e=>{
             console.log(`error`,e)
         })
    },
    // add event badge to responses
    addInvitesBadge:async function (DB,filter,eventReference) {
        db.collection(`users`).updateMany(
            filter,
            {
                $addToSet:{
                    "badgesEvents": eventReference
                },
                $inc : {
                    "badgesMain.events" : 1
                }
            }
        ).then(()=>{})
            .catch(()=>{})
    },
    userNotifyGiftBadgeDeleted:async function (db,inviterIdentifier,eventIDReference) {
        db.collection(`users`).updateMany(
            inviterIdentifier,
            {
                $addToSet: {
                    "badgesInvitesGifts": eventIDReference
                },
                $inc: {
                    "badgesMain.invites": 1
                }
            }
        ).then(() => {
        })
            .catch(() => {
            })
    },
    usersNotifyGiftBadgeAdd:async function (db,users,eventString) {
        let userUpdate = [];
        users.forEach(user=>{
            if (user.platform==="ios") {
                userUpdate.push(user.ObjectId);
            }
        });
        db.collection(`users`).updateMany(
            {
                _id:{$in:userUpdate}
            },
            {
                $addToSet:{
                    "badgesInvitesGifts": eventString
                },
                $inc : {
                    "badgesMain.invites" : 1
                }
            }
        ).then(()=>{})
            .catch(()=>{})
    },
    ownerNotifyGift:async function (db,ownerIdentifier,eventIDReference) {
        db.collection(`users`).updateMany(
            ownerIdentifier,
            {
                $addToSet:{
                    "badgesEvents": eventIDReference,
                    "badgesGifts" : eventIDReference
                },
                $inc : {
                    "badgesMain.events" : 1,
                    "badgesMain.gifts" : 1
                }
            }
        ).then(()=>{})
            .catch(()=>{});
    }
};
module.exports=addBadge;
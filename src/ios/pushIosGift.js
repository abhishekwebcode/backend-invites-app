const updateBadges = async function (DB, users) {
    const ids = [];
    users.forEach(e => {

    });
};
const sendPushIos = async function (fcm, users, eventID, gift, childname, ownername,DATABASE) {
    /*
        iOS adaption to notifications
    */
    console.log(arguments,`gifts add ios`);
    let iosTokensEnglish = [];
    let iosTokensFrench = [];
    users.forEach(e => {
        try {
            if (e.FCM_IOS) {
                if (e.language === "french") {
                    iosTokensFrench.push(e.FCM_IOS);
                } else {
                    iosTokensEnglish.push(e.FCM_IOS);
                }
            }
        } catch (e) {

        }
    });
    let message = {
        collapse_key: 'New Invite',
        notification: {
            title: `New gift choice added for ${childname} party`,
            body: `New gift choice ${gift}. Tap here to select this gift choice before it is gone.The gift choice
        was added by ${ownername} `
            /*
            * May work "click_action": "defaultCategory"
            */
        },
        "content_available": true,
        "mutable_content": true,
        data: {
            "mutable-content": true,
            type: `GIFT_ADD`,
            gift,
            eventId: eventID.toString(),
            Date: Date.now(),
            Action: `INVITE`,
            childname: childname,
            OwnerName: ownername
        }
    };
    let messageFrench = {
        collapse_key: 'New Invite',
        notification: {
            title: `Nouveau choix de cadeau ajouté pour ${childname} fête`,
            body: `Nouveau choix de cadeau ${gift}. Appuyez ici pour sélectionner ce choix de cadeau avant qu\\'il ne
        disparaisse.Le choix de cadeau a été ajouté par ${ownername} `
            /*
            * May work "click_action": "defaultCategory"
            */
        },
        "content_available": true,
        "mutable_content": true,
        collapse_key: 'New Invite',
        data: {
            "mutable-content": true,
            type: `GIFT_ADD`,
            gift,
            eventId: eventID.toString(),
            Date: Date.now(),
            Action: `INVITE`,
            childname: childname,
            OwnerName: ownername
        }
    };
    message["registration_ids"] = iosTokensEnglish;
    messageFrench["registration_ids"] = iosTokensFrench;
    console.log(`IOS ADD gift`,message,messageFrench)
    (fcm(message)).then(() => {
        }).catch((e) => {
            console.error(e)
    });
    (fcm(messageFrench)).then(() => {
        }).catch((e) => {
            console.error(e)
    });
    /*
        Update badges for ios devices
    */
    (updateBadges(DATABASE,users)).then(e => {
        }).catch(e => {
    });
    return 1;
};
module.exports = sendPushIos;
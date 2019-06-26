const PhoneNumber = require('awesome-phonenumber');
//const firebaseAdmin = require(`firebase-admin`);
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function isPlus(phone) {
    return phone.indexOf(`+`) !== -1;
}
function parsePhone(no, intlArray, localArray,prefix) {
    if (isPlus(no)) {
        intlArray.push(new PhoneNumber(no).getNumber());
        return;
    }
    intlArray.push(prefix+parseInt(no).toString());
}
function remove(element, array) {
    if (array.indexOf(element)!==-1) {
        array.splice(array.indexOf(element), 1);
    }
    return array;
}
async function searchUsers(intlArray,localarray1,  db, emails) {
    console.dir(db);
    console.dir(intlArray)
    let attendees = await db.collection(`users`).find({
        $or: [
            {"phone.number": {$in: intlArray}},
            {email: {$in: emails}}
        ]
    }).project({_id: 1, phone: 1, email: 1,FCM_Tokens:1}).toArray();
    console.dir(attendees);
    let final = [];
    for (i = 0; i < attendees.length; i++) {
        let item = attendees[i];
        let id = true;
        if (intlArray.indexOf(item.phone.number) !== -1) {
            id = false;
            intlArray = remove(item.phone.number, intlArray);
        }
        if (emails.indexOf(item.email) !== -1) {
            emails = remove(item.email, emails);
            id = false;
        }
        if (!id) {
            final.push(item);
        }
    }
    return {users: final,localArray:localarray1, emails, intlArray};
}
async function temPtoken(token,eventIdObject,fcm,sends) {
    let message = {
        to: token,
        collapse_key: 'New Invite',
        data: {
            type:`NEW_INVITE`,
            eventId:eventIdObject.toString()
        }
    };
    //console.log(`FOR DEBUG`,fcm,message);
    let seObj=fcm(message).then(console.log).catch(console.log);
    sends.push(seObj);
    //console.dir(seObj)
}
async function sendPush(registeredUsers,ids,db,eventIdObject,app) {
    let allTokens=[];
    let fcm = app.get(`FCM`);
    registeredUsers.forEach(e=>{
        try {
            allTokens.push(...(e.FCM_Tokens));
        } catch (e) {
            console.warn(`ERROR`,e);
        }
    });
    let sends=[];
    for (let i = 0; i < allTokens.length ; i++) {
        let token = allTokens[i];
        temPtoken(token,eventIdObject,fcm,sends).catch(console.log);
    }
    return 1;
    /*db.collection(`users`).updateMany(
        {_id:{$in:ids}},
        {
            $push:{
                invited:app.get(`id`)(eventIdObject)
            }
        },
    )*/
}
async function sendSMS(nonRegisteredUsers) {
    // NOT REQUIRED AS ITS DONE VIA USER APP
}
async  function sendEmails(emails) {

}
async function continue_event(numbers, emails1, db,prefix,intlArray1,localArray1) {
    let {users, localArray, emails, intlArray} = await searchUsers(intlArray1, localArray1, db, emails1);
    console.log(users, localArray, emails, intlArray);
    return {users, localArray, emails, intlArray};
}
async function createEvent(numbers, emails1, db,prefix) {
    console.log(arguments);
    let intlArray1 = [];
    let localArray1 = [];
    numbers.forEach(e => parsePhone(e, intlArray1, localArray1,prefix));
    intlArray1=(intlArray1).filter(onlyUnique);
    console.log(`intlArray`, intlArray1, `localArray`, localArray1);
    return {intlArray1,localArray1};
}
async function getRealData(rawData) {
    let numbers1=[];
    let emails1=[];
    rawData.forEach(e=>{
        if (e.indexOf(`@`)!==-1) emails1.push(e);
        else numbers1.push(e);
    });
    return {numbers1,emails1};
};
module.exports = function (app) {
    app.post(`/events/updateContacts`, async function (request, response) {
        let prefix = `+`+request.User.phone.country_prefix;
        let eventObject = request.app.get(`id`)(request.fields.eventId);
        let eventEntryBefore = await app.get(`db`)().collection(`events`).findOne({_id:eventObject},{
            projection: {
                unRegisteredNumbersInternational: 1,
                users: 1
            }
        });
        console.log(`DEBUG__`,eventObject,app.get(`db`)().collection(`events`));
        console.log(`EVENTS ENTRY BEFORE`,eventEntryBefore);
        console.log(`PREFIX`,prefix);
        let rawData = JSON.parse(request.fields.data);
        let {numbers1,emails1} = await getRealData(rawData);
        let sms_invite_link=`the link of sms invite will go here`;
        //let numberResult = await app.get(`db`)().collection(`events`).find({});
        //let {users, localArray, emails, intlArray} = await createEvent(numbers1, emails1, request.app.get(`db`)(),prefix);
        let {intlArray1,localArray1} =  await createEvent(numbers1, emails1, request.app.get(`db`)(),prefix);
        let {users, localArray, emails, intlArray} = await continue_event(numbers1, emails1, request.app.get(`db`)(),prefix,intlArray1,localArray1);

        let filteredInternational = [];
        let entryPhones = eventEntryBefore.unRegisteredNumbersInternational;
        let newPhones = intlArray;
        newPhones.forEach(phone=>{
            if (entryPhones.indexOf(phone)===-1) {
                filteredInternational.push(phone);
            }
        });
        console.log(`NEW RAW NUMBERS`,filteredInternational,`--++--`,entryPhones,newPhones);


        console.log(`---`,users,eventEntryBefore.users,`---`);
        let hashes=[];
        let newUsers=[];
        eventEntryBefore.users.forEach(e=>hashes.push(e.toHexString()));
        users.forEach(e=>{
            if (hashes.indexOf(e._id.toHexString())===-1) {
                newUsers.push(e);
            }
        });
        console.log(`NEW USERS NOW ARE`,newUsers);
        remove(request.email,emails);
        //remove(request.User.phone.national_number,localArray);
        remove(request.User.phone.number,intlArray);
        let usersIdsobjs = [];
        newUsers.forEach(e => usersIdsobjs.push(e._id));

        let eventsUpdate = await app.get(`db`)().collection(`events`).findOneAndUpdate(
            {_id:eventObject},
            {
                $addToSet : {
                    users: {$each:newUsers} ,
                    unRegisteredNumbersLocal: {$each:localArray},
                    unRegisteredNumbersInternational: {$each:filteredInternational},
                    unRegisteredEmails: {$each: emails}
                }
            }
        );
        console.log(`UPDATE EVENT CONTACTS DETAIL`,eventsUpdate);

        /**
         * Filtering users to respond to only un-responded ones
         */
        let exisitngUsers = await app.get(`db`)().collection(`users`).find({
            _id: { $in : eventEntryBefore.users }
        }).project({email:1}).toArray();
        let allUsers = users.concat(exisitngUsers);
        let allNumbers = eventEntryBefore.unRegisteredNumbersInternational.concat(intlArray);
        let usersALLNEW = allUsers.map(e=>e.email);
        let usersUniqueAll = [...new Set(usersALLNEW)];
        let phoneAllUnique = [...new Set(allNumbers)];
        console.log(`ALLL`,usersUniqueAll,phoneAllUnique);
        let toRespond = await app.get(`db`)().collection(`responses`).find({
            email:usersUniqueAll,eventID:eventObject
        }).project({email:1}).toArray();
        console.log(toRespond);

        //sendPush(newUsers,usersIdsobjs,request.app.get(`db`)(),eventObject,app);
        //sendSMS([...localArray, ...intlArray]);
        let sendString="";
        //sendEmails(emails);
        let send_sms = intlArray.length>0;
        if (eventsUpdate.ok===1) {
            response.json({success: true,send_sms,sms_invite_link,send_sms_datas:filteredInternational.join(";")})
        } else {
            response.json({success: false, message: `Error creating your party`});
        }
        return;
    });
};
const PhoneNumber = require('awesome-phonenumber');
//const firebaseAdmin = require(`firebase-admin`);

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
    let attendees = await db.collection(`users`).find({
        $or: [
            {"phone.number": {$in: intlArray}},
            {email: {$in: emails}}
        ]
    }).project({_id: 1, phone: 1, email: 1}).toArray();
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
    return {users: final, l, emails, intlArray};
}
async function sendPush(registeredUsers,ids,db,eventIdObject,app) {
    db.collection(`users`).updateMany(
        {_id:{$in:ids}},
        {
            $push:{
                invited:app.get(`id`)(eventIdObject)
            }
        },
        {upsert:true,}
    )
}
async function sendSMS(nonRegisteredUsers) {
    // NOT REQUIRED AS ITS DONE VIA USER APP
}
async  function sendEmails(emails) {

}
async function createEvent(numbers, emails1, db,prefix) {
    console.log(arguments);
    let intlArray1 = [];
    let localArray1 = [];
    numbers.forEach(e => parsePhone(e, intlArray1, localArray1,prefix));
    console.log(`intlArray`, intlArray1, `localArray`, localArray1);
    let {users, localArray, emails, intlArray} = await searchUsers(intlArray1, localArray1, db, emails1);
    console.log(users, localArray, emails, intlArray);
    return {users, localArray, emails, intlArray};
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
    app.post(`/events/add`, async function (request, response) {
        let prefix = request.User.phone.country_prefix;
        console.log(`PREFIX`,prefix);
        console.log(arguments);
        let rawData = JSON.parse(request.fields.data);
        let {numbers1,emails1} = await getRealData(rawData);
        let event = JSON.parse(request.fields.event);
        let sms_invite_link=`the link of sms invite will go here`;
        //let numberResult = await app.get(`db`)().collection(`events`).find({});
        let send_sms = numbers1.length>0;
        let {users, localArray, emails, intlArray} = await createEvent(numbers1, emails1, request.app.get(`db`)(),prefix);
        remove(request.email,emails);
        remove(request.User.phone.national_number,localArray);
        remove(request.User.phone.number,intlArray);
        let usersIdsobjs = [];
        users.forEach(e => usersIdsobjs.push(e._id));
        event["date"] = new Date(parseInt(event["date"]));
        event["isSpecialTheme"] = (event["isSpecialTheme"] === "true");
        event["guestSee"] = (event["guestSee"] === "true");
        console.log(event);
        var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress || ``;
        let events = await app.get(`db`)().collection(`events`).insertOne(
            {
                ...event,
                created_by: request.email,
                date_created: Date.now(),
                users: usersIdsobjs,
                unRegisteredNumbersLocal: localArray,
                unRegisteredNumbersInternational: intlArray,
                unRegisteredEmails: emails,
                ip_created: ip
            }
        );
        sendPush(users,usersIdsobjs,request.app.get(`db`)(),events.insertedId,app);
        sendSMS([...localArray, ...intlArray]);
        sendEmails(emails);
        console.dir(events);
        if (events.insertedCount === 1) {
            response.json({success: true,send_sms,sms_invite_link})
        } else {
            response.json({success: false, message: `Error creating your party`});
        }
        return;
    });
};
const PhoneNumber = require('awesome-phonenumber');
function isPlus(phone) {
    return phone.indexOf(`+`) !== -1;
}
function parsePhone(no, intlArray, localArray) {
    if (isPlus(no)) {
        intlArray.push(new PhoneNumber(no).getNumber());
        return;
    }
    localArray.push(parseInt(no).toString());
}
function remove(element, array) {
    if (array.indexOf(element)!==-1) {
        array.splice(array.indexOf(element), 1);
    }
    return array;
}
async function searchUsers(intlArray, localArray, db, emails) {
    let attendees = await db.collection(`users`).find({
        $or: [
            {"phone.number": {$in: intlArray}},
            {"phone.national_number": {$in: localArray}},
            {email: {$in: emails}}
        ]
    }).project({_id: 1, phone: 1, email: 1}).toArray();
    console.dir(attendees);
    let final = [];
    for (i = 0; i < attendees.length; i++) {
        let item = attendees[i];
        id = true;
        if (localArray.indexOf(item.phone.national_number) !== -1) {
            id = false;
            localArray = remove(item.phone.national_number, localArray);
        }
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
    return {users: final, localArray, emails, intlArray};
}
async function sendPush(registeredUsers,ids,db,eventIdObject) {
    db.collection(`users`).updateMany(
        {_id:{$in:ids}},
        {
            $push:{
                invited:{a:`here is data`}
            }
        },
        {upsert:true,}
    )
}
async function sendSMS(nonRegisteredUsers) {

}
async function createEvent(numbers, emails1, db) {
    console.log(arguments);
    let intlArray1 = [];
    let localArray1 = [];
    numbers.forEach(e => parsePhone(e, intlArray1, localArray1));
    console.log(`intlArray`, intlArray1, `localArray`, localArray1);
    let {users, localArray, emails, intlArray} = await searchUsers(intlArray1, localArray1, db, emails1);
    console.log(users, localArray, emails, intlArray);
    return {users, localArray, emails, intlArray};
}
module.exports = function (app) {
    app.post(`/events/add`, async function (request, response) {
        console.log(arguments);
        let numbers1 = JSON.parse(request.fields.numbers);
        let emails1 = JSON.parse(request.fields.emails);
        //let numberResult = await app.get(`db`)().collection(`events`).find({});
        let {users, localArray, emails, intlArray} = await createEvent(numbers1, emails1, request.app.get(`db`)());
        remove(request.email,emails);
        remove(request.User.phone.national_number,localArray);
        remove(request.User.phone.number,intlArray);
        let usersIdsobjs = [];
        users.forEach(e => usersIdsobjs.push(e._id));
        let event = JSON.parse(request.fields.event);
        event["date"] = new Date(parseInt(event["date"]));
        event["isSpecialTheme"] = (event["isSpecialTheme"] == "true" ? true : false);
        event["guestSee"] = (event["guestSee"] == "true" ? true : false);
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
        sendPush(users,usersIdsobjs,request.app.get(`db`)(),events.insertedId);
        sendSMS([...localArray, ...intlArray]);
        console.dir(events);
        if (events.insertedCount == 1) {
            response.json({success: true})
        } else {
            response.json({success: false, message: `Error creating your party`});
        }
        return;
    });
};
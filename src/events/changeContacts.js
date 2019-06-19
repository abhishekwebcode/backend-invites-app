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
    return {users: final,localArray:localarray1, emails, intlArray};
}

/**
 * @deprecated
 * The feature is no longer required as push goes via user end and/or fcm directly
 * @param registeredUsers
 * @param ids
 * @param db
 * @param eventIdObject
 * @param app
 * @returns {Promise<void>}
 */
async function sendPush(registeredUsers,ids,db,eventIdObject,app) {
    return ;
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
    intlArray1=(intlArray1).filter(onlyUnique);
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

module.exports=function (app) {
  app.post(`/event/updateContacts`,function (request,response) {
      let db = request.app.get(`db`)();
      let eventIDOBJ=request.app.get(`id`)(request.fields.eventId);

  })
};
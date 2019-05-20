const PhoneNumber = require( 'awesome-phonenumber' );
function isPlus(phone){
    return phone.indexOf(`+`)!==-1;
}
function parsePhone(no,intlArray,localArray) {
    if (isPlus(no)) {
        intlArray.push(new PhoneNumber(no).getNumber());
    }
    localArray.push(parseInt(no).toString());
}
function remove(element,array) {
    array.splice(a.indexOf(element),1);
    return array;
}

async function searchUsers(intlArray,localArray,db,emails) {
    let attendees = await db.collection(`users`).find({
        $or : [{"phone.number":{$in:{intlArray}}},{"phone.national_number":{$in:localArray}},{email:{$in:emails}}]
    }).project({_id:1,phone:1,email:1}).toArray();
    let final=[];
    for (i=0;i<attendees.length();i++) {
        let item = attendees[i];
        id=true;
        if (localArray.indexOf(item.phone.national_number)!==-1) {
            id=false;
            localArray=remove(item.phone.national_number,localArray);
        }
        if (intlArray.indexOf(item.phone.number)!==-1) {
            id=false;
            intlArray=remove(item.phone.number,intlArray);
        }
        if (emails.indexOf(item.email)!==-1) {emails=remove(item.email,emails);id=false;}
        if (id) {
            final.push(item._id);
        }
    }
    return {users:final,localArray,emails,intlArray};
}

async function createEvent(request,response) {

}

module.exports=function (app) {
    app.post(`/events/add`,async function(request,response) {
        console.log(arguments);
        let numbers = JSON.parse(request.fields.numbers);
        let emails = JSON.parse(request.fields.emails);
        let numberResult = await app.get(`db`)().collection(`events`).find({})
        let event=JSON.parse(request.fields.event);
        event["date"]=new Date(parseInt(event["date"]));
        event["isSpecialTheme"]=(event["isSpecialTheme"]=="true"?true:false);
        event["guestSee"]=(event["guestSee"]=="true"?true:false);
        console.log(event);
        let events = await app.get(`db`)().collection(`events`).insertOne(
            {...event,created_by:request.email,date_created:Date.now()}
        );
        if (events.insertedCount==1) {
            response.json({success: true})
        }
        else
        {response.json({success: false,message:`Error creating your party`})}
        return ;
    });
}
const removeInner = function (DB,user,key,eventID) {
    console.trace(`badges remove inner`);
    console.log(arguments);

    let update=[];
    update[key]=eventID;
    DB.collection(`users`).findOneAndUpdate(
        {
            email:user.email
        },
        {
            $pull : update
        }
    )
        .then(
            ()=>{}
        )
        .catch(()=>{});
};
module.exports=removeInner;
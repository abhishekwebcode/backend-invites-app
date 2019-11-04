const removeInner = function (DB,user,key,eventID) {
    //console.trace(`badges remove inner`);
    console.log(arguments);
    let update={};
    update[key]=eventID;
    console.log(`paramters remove inner`,
        {
            email:user.email
        },
        {
            $pull : update
        }
    );
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
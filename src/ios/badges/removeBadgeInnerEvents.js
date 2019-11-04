const removeInner = function (DB,user,key,eventID) {
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
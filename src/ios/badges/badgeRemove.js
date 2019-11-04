const badgeRemove = function (DB,user,key) {
    let update = {};
    update[key] = 0;
    DB.collection(`users`).findOneAndUpdate(
        {_id:user.ObjectId},
        {
            $set : update
        }
    )
        .then(()=>{})
        .catch(()=>{});
};
module.exports=badgeRemove;
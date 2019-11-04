const badgeRemove = function (DB,user,key) {
    console.trace(`badges remove`);
    console.log(arguments);
    let update = {};
    update[key] = 0;
    DB.collection(`users`).findOneAndUpdate(
        {_id:user._id},
        {
            $set : update
        }
    )
        .then(()=>{})
        .catch(()=>{});
};
module.exports=badgeRemove;

module.exports=async function(DB,offset,limit,filter) {
    let companies = await DB().collection(`companies`).find({},{id:1,title:1,logo_url:1,jobs:1}).sort({jobs:-1}).skip(offset).limit(limit).toArray();
    if (filter) companies=filter(companies);
    return companies;
};

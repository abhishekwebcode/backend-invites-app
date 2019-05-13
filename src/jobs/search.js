const getIP = require('ipware')().get_ip;
const requestify = require('requestify');
async function getJobsSearch(DB,req,res) {
    let IP = getIP(req);
    const ip1=`http://ip-api.com/json/${IP}`;
    let loc = await requestify.get(ip1);
    //TODO IMPLEMENT JOB LISTING LOGIC
    let mock = {
        id:`kdsjif43oi5j34i5nh3hu5`,
        title:`Event Team Leader`,
        salary:`RM2,000.00-RM2,500.00 Per Month`,
        type:`Full Time`,
        company_url:`https://source.unsplash.com/random/100x100`,
        tag:`Urgent Job!`,
        company_name:`TC Advertising Sdn Bhd (Orins Advertising)`,
        location:`Malayasia`
    };
    let r=[];
    for (let i = 0; i < 10 ; i++) {
        r.push(mock);
    }
    return r;
};

module.exports=function (app) {
    app.all(`/jobs/search`,async function(request,response) {

    })
}
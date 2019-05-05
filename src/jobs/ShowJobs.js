async function getJobsList(DB) {
    //TODO IMPLEMENT JOB LISTING LOGIC
    let mock = {
        title:`Event Team Leader`,
        salary:`RM2,000.00-RM2,500.00 Per Month`,
        type:`Full Time`,
        company_url:`https://source.unsplash.com/random/100x100`,
        tag:`Urgent Job!`,
        company_bane:`TC Advertising Sdn Bhd (Orins Advertising)`
    };
    let r=[];
    for (let i = 0; i < 10 ; i++) {
        r.push(mock);
    }
    return r;
};

module.exports=function (app) {
    app.all(`/jobs/list`,async function (request,response) {
        let jobs = await getJobsList(request.app.get("db"));
        response.json({
            success:true,
            result:jobs
        })
    });
};
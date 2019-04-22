class job {
    constructor(props) {
        this.title=arguments[0];
    }
}

var jobModule = {
    /**
     *
     * @param db
     * @param userObject
     * @param offset
     * @returns {Promise<Array<job>>}
     */
    getJobs: async function (db, userObject,offset=0) {
        let jobs = await db().collection(`jobs`).find({
            $or: {
                hollandScore : userObject.holland.hollandScore,
                meyersScore  : userObject.meyers.meyersScore
            }
        }).skip(offset).limit(10).toArray();
        return jobs;
    }
};

// user based job module endpoints
module.exports=function (app) {
    app.post(`/job/list`,async function (request,response) {
        let db = request.app.get(`db`);
        let user = await db().collection(`users`).findOne({email:request.email}).toArray();
        let data = await jobModule.getJobs(db,user,request.fields.offset);
        response.json({
            success:true,
            DATA:data
        })
    })
};
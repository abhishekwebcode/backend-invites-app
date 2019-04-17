function sortJobs(list,priorit) {
    let clusters=[];
    let level1 = priorit[0];
    let level1_groups=[];
    let currentCluster=[];
    list.forEach(item=>{
        if (level1_groups.indexOf(item[preference][level1])!==-1) {
            currentCluster.push(item);
        }
        else {
            clusters.push(currentCluster);
            currentCluster=[];
            currentCluster.push(item);
        }
    })
}
module.exports = async function(Db,type) {
    let db = await Db();
    let jobs = db.collection(`jobs`);
    let jobs_initial = await jobs.find({type}).limit(10).toArray();
    let list = sortJobs(jobs_initial);
    return list;
};

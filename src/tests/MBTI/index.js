/*
* Sample Question Schema
{
    title: " {Question Title} "
    answers : [
    *   {
    * option : "Option 1" , value : `I`
    * },
    *   {
    * option : "Option 2" , value : `J`
    * }
    * ]
 }
 *
*
*
* */

let getTest = async function (db) {
    let MBTI = await db.collection(`tests`).findOne({title:`BMTI`});
    return MBTI;
}

let getQuestions = async function (db) {
    let questions = await db.collection(`meyers`).find({"answers.option":{"$exists":true},"title":{"$exists":true}},{"title":1,"answers.option":1}).limit(20).toArray();
    return questions;
}

module.exports=async function (request,response,next) {
    let db = getTest(request.app.get("db")());
    response.json({
        success:true,
        test:{
            questions:getQuestions(db)
        }
    });
    response.end();
    return ;
}

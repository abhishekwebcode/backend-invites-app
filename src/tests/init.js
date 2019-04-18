/**
 // ATTACH TEST APIS
 */
function init(app) {
    app.post('/tests/meta',async function (request,response) {
        let type = request.fields.test_type ;
        let test_meta = await request.app.get("db")().collection(`tests_meta`).find({test_name:type}).toArray();
        response.json({success:true,result:test_meta});
    });
    require("../tests/meyers/index")(app);
    require(`../tests/holland/index`)(app);
}
module.exports=init;

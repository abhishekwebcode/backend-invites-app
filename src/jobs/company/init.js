module.exports=function (app) {
    app.all("/jobs/companies/top",async function(req,res,next) {
        let topCompanies = await require("./getTopCompanies")(req.app.get("db"),req.fields.offset||0,req.fields.limit||100);
        res.json({
            success:true,
            result:topCompanies
        })
    })
};
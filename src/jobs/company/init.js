module.exports=function (app) {
    app.all("/companies/Top",async function(req,res,next) {
        let topCompanies = await require("./getTopCompanies")(req.app.get("db"),req.fields.offset,req.fields.limit||10);
        res.json({
            success:true,
            result:topCompanies
        })
    })
};
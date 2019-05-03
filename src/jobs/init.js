module.exports=function (app) {
    // initialise endpoints for user of the app for job based tasks
    require(`./user/init`)(app);
    require(`./company/init`)(app);
};
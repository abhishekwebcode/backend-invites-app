/**
 *
 * @param {number} app
 */
module.exports=function(app) {
    //register main events handler
    require(`./event`)(app);
    // register add event handler
    require(`./addEvent`)(app);
};


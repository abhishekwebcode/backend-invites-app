let options = {
    server: {
        auto_reconnect: true,
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 6000000,
            socketTimeoutMS: 6000000,
        }
    },
    replset: {
        auto_reconnect: true,
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 6000000,
            socketTimeoutMS: 6000000,
        }
    }
};
const uri = "mongodb://localhost:27017";
const MongoClient = require('mongodb').MongoClient;
var db;
MongoClient.connect(uri, options, function (err, client) {
    if (err) throw err;
    db = client.db(`test`);
    console.log(`MONGODB CONNECTED NOW`);
});
/**
 * Returns the sum of a and b
 * @returns {MongoClient} Promise object represents the sum of a and b
 */
function getDB() {
    return db;
}
module.exports = getDB;
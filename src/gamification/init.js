var gamification = {
    getScores:async function (userEmail,db) {
        let scores = await db().collection(`users`).findOne({email:userEmail},{friends:1,meyers:1,holland:1}).toArray();
        return scores;
    },
    getUserFriends: async function(useremail,db) {
        let Ids = await db().collection(`users`).find({email: userEmail}, {"facebook.friends.idList": 1}).toArray();
        return await db().collection(`users`).find({"facebook.id":{$in:Ids}},{_id:1}).toArray();
    },
    getFriendsScores: async function (userEmail,db) {
        let friends = await gamification.getUserFriends(userEmail,db);
        return await db().collection(`users`).find({_id: {$in:friends}}, {meyers: 1,holland:1}).toArray();
    },
    getBadges:async function(userEmail,db) {
        return await db().collection(`users`).findOne({email:userEmail},{badges:1}).toArray();
    }
};

module.exports=function (app) {
  app.post(`/scores`,async function (request,response) {
      let data = await gamification.getScores(request.email,request.app.get("db"));
      return response.json({
          success:true,
          DATA:data
      });
  });
    app.post(`/friendsScore`,async function (request,response) {
        let data = (await gamification.getFriendsScores(request.email,request.app.get("db")));
        return response.json({
            success:true,
            DATA: data
        })
    });
    app.post(`/badges`,async function(request,response) {
        let data = await gamification.getBadges(request.email,request.app.get("db"));
        return response.json({
            success:true,
            DATA: data
        })
    });
};
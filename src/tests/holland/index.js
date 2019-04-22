module.exports=function (app) {
    app.post(`/tests/holland/getQuestions`,async function (req,res) {
        let questions = await req.app.get('db').collection(`holland`).find({"answers.option":{"$exists":true},"title":{"$exists":true}},{"title":1,"answers.option":1}).limit(20).toArray();
        res.json({success:true,questions})
    });
    app.post(`/tests/holland/submitTest`,async function(req,res) {
        let score={
            REALISTIC:0,
            SOCIAL:0,
            INVESTIGATIVE:0,
            ENTERPRISING:0,
            ARTISTIC:0,
            CONVENTIONAL:0,
        };
        let inc=JSON.parse(req.fields.answerdata);
        let questionIds=[];
        let answermappings = {};
        inc.forEach(e=>{
            answermappings[e._id]=e.option;
            questionIds.push(e._id);
        });
        let questionsStore = await req.app.get(`db`)().collection(`holland`).find({_id:{$in:questionIds}}).toArray();
        questionsStore.every(function (item) {
            let selected = answermappings[item._id];
            item.answers.forEach(an=>{
                if (an.option===selected) {
                    score[an.value]+=1;
                }
            })
        });
        let a=[];
        for (let u in score) {a.push({type:u,value:score[u]})}
        a.sort( function ( a, b ) { return b.value - a.value; } );
        let inferredPersonalityType=a[0].type;
        if (a[0].value===0) res.json({success:false,CODE:`INVALID_TEST`});
        let updateScore = await req.app.get(`db`)().collection(`users`).findOneAndUpdate({email:req.email}, {
                $set : {
                    holland: {
                        hollandScore: inferredPersonalityType,
                        hollandAttempt: answermappings,
                        scoreCard: score
                    }
                }
            },{upsert:true}
        );
        app.get(`event`).emit('NEW_TEST',{user:req.email,updateScore:updateScore,score:score,inferredPersonalityType:inferredPersonalityType,type:`holland`});
        res.json({success:true,CODE:`SUCCESS_TEST`,PERSONALITY:inferredPersonalityType,TYPE:`holland`});
    });
};

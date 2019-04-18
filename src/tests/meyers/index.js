module.exports=function (app) {
    app.post(`/tests/meyers/getQuestions`,async function (req,res) {
        let questions = await req.app.get('db')().collection(`meyers`).find({"answers.option":{"$exists":true},"title":{"$exists":true}},{"title":1,"answers.option":1}).limit(20).toArray();
        res.json({success:true,questions})
    });
    app.post(`/tests/meyers/submitTest`,async function(req,res) {
        let ider=req.app.get("id");
        let score={E:0,S:0,T:0,J:0,I:0,N:0,F:0,P:0};
        let inc=JSON.parse(req.fields.answerdata);
        let questionIds=[];
        let answermappings = {};
        inc.forEach(e=>{
            answermappings[e._id]=e.option;
            questionIds.push(ider(e._id));
        });
        let questionsStore = await req.app.get(`db`)().collection(`meyers`).find({_id:{$in:questionIds}}).toArray();
        console.log(`DBBB`,questionsStore);
        questionsStore.every(function (item) {
            let selected = answermappings[item._id];
            item.answers.forEach(an=>{
                if (an.option===selected) {
                    score[an.value]+=1;
                }
            })
        });
        console.dir(score);
        let a=[];
        for (let u in score) {a.push({type:u,value:score[u]})}
        a.sort( function ( a, b ) { return b.value - a.value; } );
        let inferredPersonalityType=a[0].type;
        if (a[0].value===0) res.json({success:false,CODE:`INVALID_TEST`});
        console.dir({email:req.email});
        console.dir({
            meyersScore:inferredPersonalityType,
            meyersAttempt:answermappings,
            scoreCard:score
        });
        console.log([{email:req.email}, {
                meyersScore:inferredPersonalityType,
                meyersAttempt:answermappings,
                scoreCard:score
            },    { upsert: true }
        ]);
        let updateScore = await req.app.get(`db`)().collection(`users`).findOneAndUpdate({email:req.email}, {$set: {
                meyersScore: inferredPersonalityType,
                meyersAttempt: answermappings,
                scoreCard: score
            }},    { upsert: true }
        );
        app.get(`event`).emit('NEW_TEST',{user:req.email,updateScore:updateScore,score:score,inferredPersonalityType:inferredPersonalityType,type:`MEYERS`});
        res.json({success:true,CODE:`SUCCESS_TEST`,PERSONALITY:inferredPersonalityType,TYPE:`MEYERS`});
    });
};

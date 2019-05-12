module.exports = function (app) {
    app.all(`/tests/meyers/getQuestions`, async function (req, res) {
        let questions = await req.app.get('db')().collection(`meyers`).find({}, {projection: {"answers.value": 0}}).limit(20).toArray();
        res.json({success: true, questions})
    });
    app.all(`/tests/meyers/submitTest`, async function (req, res) {
        console.log(arguments, this);
        let ider = req.app.get("id");
        let score = {E: 0, S: 0, T: 0, J: 0, I: 0, N: 0, F: 0, P: 0};
        let inc = JSON.parse(req.fields.answerdata);
        let questionIds = [];
        let answermappings = {};
        inc.forEach(e => {
            answermappings[e.ID] = e.option;
            questionIds.push(ider(e.ID));
        });
        console.dir(inc);
        console.dir(questionIds);
        let questionsStore = await req.app.get(`db`)().collection(`meyers`).find({_id: {$in: questionIds}}).toArray();
        console.log(`DBBB`, questionsStore);
        let questionsStoreNew = {};
        questionsStore.forEach(item=>{
            questionsStoreNew[item._id.toHexString()]=item;
        });
        for (let id in answermappings) {
            let option = answermappings[id];
            let question = questionsStoreNew[id];
            console.log(option,question);
            question.answers.forEach((f)=>{
                if (f.option==option) {
                    // the derived type personality via current question
                    let value = f.value;
                    score[value]+=1
                }
            })
        }
        console.dir(score);
        let a = [];
        for (let u in score) {
            a.push({type: u, value: score[u]})
        }
        a.sort(function (a, b) {
            return b.value - a.value;
        });
        let inferredPersonalityType = a[0].type;
        let inferredTypeCombo = a[0].type + a[1].type + a[2].type + a[3].type;
        if (a[0].value === 0) {
            res.json({success: false, CODE: `INVALID_TEST`});
            res.end();
            return;
        }
        let updateScore = await req.app.get(`db`)().collection(`users`).findOneAndUpdate(
            {email: req.email}, {
                $set: {
                    meyersDone: true,
                    meyers: {
                        meyersScore: inferredPersonalityType,
                        meyersAttempt: answermappings,
                        scoreCard: score,
                        meyersComboScore: inferredTypeCombo
                    }
                }
            }, {upsert: true}
        );
        app.get(`event`).emit('NEW_TEST', {
            user: req.email,
            updateScore: updateScore,
            score: score,
            inferredPersonalityType: inferredPersonalityType,
            type: `MEYERS`
        });
        res.json({success: true, CODE: `SUCCESS_TEST`, PERSONALITY: inferredPersonalityType, TYPE: `MEYERS`, score});
    });
};

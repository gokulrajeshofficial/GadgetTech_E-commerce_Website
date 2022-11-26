const mongoClient = require('mongodb').MongoClient

const state = {
    db:null
}
module.exports.connect = (done)=>
{
    const url = "mongodb+srv://gadgetTechDB:GOKUL123@cluster0.tyblrq9.mongodb.net/test"
    const dbname = 'GadgetTech'
    mongoClient.connect(url , (err,data)=>{
        if(err)
        {return done(err)} 
        state.db = data.db(dbname);
        done();
    })
  
}

module.exports.get = function()
{
    return state.db
}
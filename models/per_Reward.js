const mongoose = require('mongoose');

const schema = mongoose.Schema;

const RewardSchema = new schema({

RewardID :{
    
    type : String,
    required : true
},

Name : {
    type : String,
    required: true
    
},
date : {
    type : Date,
    default: Date.now
},

empid : {
    type : String,
    
},
place : {
    type : Number
}


})
//targetSchema.index({ date: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const Rewards = mongoose.model("Reward",RewardSchema);

module.exports =Rewards;
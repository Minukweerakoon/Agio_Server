const mongoose = require('mongoose');

const schema = mongoose.Schema;

const targetSchema = new schema({
empid : {
    type : String,
    required: true
},
target : {
    type : Number,
    
},
date : {
    type : Date,
    default: Date.now
},
endDate :{
    type : Date,
    default: function() {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
}


})
//targetSchema.index({ date: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const targets = mongoose.model("Target",targetSchema);

module.exports =targets;
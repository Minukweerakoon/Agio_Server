const mongoose = require('mongoose');

const schema = mongoose.Schema;

const P_record_schema = new schema({
empid : {
    type : String,
    required: true
},
Group : {
    type : String,
    required: true
},
Line : {
    type : Number,
    required: true
},
YieldDry : {
    type : Number,
    required: true
},
YieldCutsWet : {
    type : Number,
    required: true
},
Grade_A_Cuts : {
    type : Number,
    required: true
},
Grade_B_Cuts : {
    type : Number,
    required: true
},
Grade_C_Cuts : {
    type : Number,
    required: true
},
Grade_F_Cuts : {
    type : Number,
    required: true
},
date : {
    type : Date,
    default: Date.now
},
score: {
    type: Number
}


})

const performance_record = mongoose.model("performance_record",P_record_schema);

module.exports = performance_record;
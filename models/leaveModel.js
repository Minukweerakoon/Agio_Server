const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    userid:{
        type: String,
        required: true,

    },
    name: {
        type: String,
        required: true
    },
    RangePicker: {
        type: [Array],
        required: true
    },
    Type: {
        type: String,
        required: true,
        
    },
    department: {
        type: String,
        required: true,
        
    },
    
    Description: {
        type: String,
        required: true
    },
    status:{
        type:String,
        default:"pending",


    },
    medical_leave: {
        type: Number,
        default: 4// Default value for the medical_leave field
    },
    general_leave: {
        type: Number,
        default: 6// Default value for the medical_leave field
    },
    annual_leave: {
        type: Number,
        default: 10// Default value for the medical_leave field
    },

  
   
}, {
    timestamps: true
});



const leaveModel = mongoose.model("Leave", userSchema);
module.exports = leaveModel;
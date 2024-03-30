const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    /*userId:{
        type: String,
        required: true

    }*/
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
  
   
}, {
    timestamps: true
});



const leaveModel = mongoose.model("Leave", userSchema);
module.exports = leaveModel;
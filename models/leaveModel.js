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
    
    
    Description: {
        type: String,
        required: true
    },
    status:{
        type:String,
        default:"pending",


    },
    file: {
        type: Object,
        required:false,
    },
    

  
   
}, {
    timestamps: true
});



const leaveModel = mongoose.model("Leave", userSchema);
module.exports = leaveModel;
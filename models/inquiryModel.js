const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    inquirydate: {
        type: Date,
        required: true,
        
    },
    phoneNumber: {
        type: String,
        required: true,
        
    },
    describe: {
        type: String,
        required: true
    },
   
}, {
    timestamps: true
});



const inquiryModel = mongoose.model("Inquiry", userSchema);
module.exports = inquiryModel;
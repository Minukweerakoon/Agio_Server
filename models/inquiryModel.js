const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    inquirydate: {
        type: Date,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    describe: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Done'], 
        default: 'Pending'
    },
    reply: {
        type: String 
    }
    
}, {
    timestamps: true
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;

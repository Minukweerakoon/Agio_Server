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
        type: Date, // Keep the type as Date
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
    },
    inquiryID: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

// Middleware function to extract only the date part of inquirydate
inquirySchema.pre('save', function(next) {
    // Extract date part only and set it to the inquiry date field
    this.inquirydate = this.inquirydate.toISOString().split('T')[0];
    next();
});


const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;

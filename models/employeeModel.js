const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    username_log: {
        type: String,
        required: true,
        unique: true // Ensures uniqueness at the database level
    },
    password_log: {
        type: String,
        required: true,
        
    },
    jobRole: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true
    },
    dateJoined: {
        type: Date,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    isDoctor:{
        type:Boolean,
        default:false,

    },
    isAdmin:{
        type:Boolean,
        default:false,

    },
    isAnnHrsup:{
        type:Boolean,
        default:false,

    },
    isLeaveHrsup:{
        type:Boolean,
        default:false,

    },
    seenNotifications:{
        type :Array,
        default:[],
    },
    unseenNotifications:{
        type :Array,
        default:[],

    }
}, {
    timestamps: true
});



const employeeModel = mongoose.model("Employee", userSchema);
module.exports = employeeModel;
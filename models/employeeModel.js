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
    empid: {
        type: String,

        unique: true
        
    },
    jobRole: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true
    },
    department: {
        type: String,
        
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
    islogisticsMan:{
        type:Boolean,
        default:false,

    },
    isuniform:{
        type:Boolean,
        default:false,

    },
    isinsu:{
        type:Boolean,
        default:false,

    },
    isinquiry:{
        type:Boolean,
        default:false,

    },
    isperfomace:{
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
    warnings: [
        {
            date: {
                type: Date,
                required: true
            },
            message: {
                type: String,
                required: true
            }
        }
    ]
   
}, {
    timestamps: true
});



const employeeModel = mongoose.model("Employee", userSchema);
module.exports = employeeModel;
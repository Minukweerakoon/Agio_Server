const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    driName: {
        type:String,
        required:true
    },
    driEmail: {
        type:String,
        required:true
    },
    WorkExpereance: {
    type: String,
    required: true,
  },
  regdate: {
    type: Date, // Changed to Date for better date handling
    required: true,
  },
  
  driPnum: {
    type: String,
    required: true,
  },
  
});

const TraDriverModel = mongoose.model("DriverDetails", userSchema);

module.exports = TraDriverModel;
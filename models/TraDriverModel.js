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
    Type: {
    type: String,
    required: true,
  },
  regdate: {
    type: Date, // Changed to Date for better date handling
    required: true,
  },
  
    driPnum: {
    type: Number,
    required: true,
  },
  
});

const TraDriverModel = mongoose.model("DriverDetails", userSchema);

module.exports = TraDriverModel;
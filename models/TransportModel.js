const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    EmpName: {
        type:String,
        required:true
    },
    EmpEmail: {
        type:String,
        required:true
    },
  Type: {
    type: String,
    required: true,
  },
  bookingdate: {
    type: Date, // Changed to Date for better date handling
    required: true,
  },
  
  Details: {
    type: String,
    required: true,
  },
  
});

const AnnHRSupervisorModel = mongoose.model("Transport", userSchema);

module.exports = AnnHRSupervisorModel;
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userid:{
    type: String,
    required: true

  },
  anntitle: {
    type: String,
    required: true,
  },
  uploaddate: {
    type: Date, // Changed to Date for better date handling
    required: true,
  },
  Type: {
    type: String,
    required: true,
  },
  Department: {
    type: String,
    required: false,
  },
  expiredate: {
    type: Date, // Changed to Date for better date handling
    required: true,
  },
  // Assuming each announcement can have multiple files
  file: {
    type: Object,
    required:false,
},

  Description: {
    type: String,
    required: true,
  },
  
});

const AnnHRSupervisorModel = mongoose.model("Announcement", userSchema);

module.exports = AnnHRSupervisorModel;

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
video: {
  type: String, // Assuming you'll store the file path or name
  required: false,
},

  Description: {
    type: String,
    required: true,
  },
  comment: [{
    
    text: String,
    empId :String,
    createdAt: Date
}],


  
});

const AnnHRSupervisorModel = mongoose.model("Announcement", userSchema);

module.exports = AnnHRSupervisorModel;

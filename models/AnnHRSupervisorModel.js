const mongoose = require('mongoose');

const annSupervisorSchema = new mongoose.Schema({
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
  expiredate: {
    type: Date, // Changed to Date for better date handling
    required: true,
  },
  upload: {
    type: String, // Path or URL to the uploaded file
    // Not required unless you want every announcement to include a file
  },
  Description: {
    type: String,
    required: true,
  },
});

const AnnHRSupervisorModel = mongoose.model("AnnHRSupervisor", annSupervisorSchema);

module.exports = AnnHRSupervisorModel;

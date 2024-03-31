const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Type: {
        type:String,
        required:true
    },
    vehicleNum: {
        type:String,
        required:true
    },
    ECDetails: {
    type: String,
    required: true,
  },
  LicenceDetails: {
    type: String, // Changed to Date for better date handling
    required: true,
  },
  
  OwnerDetails: {
    type: String,
    required: true,
  },
  
});

const TraVehicleModel = mongoose.model("VehicleDetails", userSchema);

module.exports = TraVehicleModel;
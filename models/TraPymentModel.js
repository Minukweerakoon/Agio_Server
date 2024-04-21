const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    file: {
        type:String,
        required:true
    },
   
  
  
});

const TraPaymentModel = mongoose.model("BookingPayment", userSchema);

module.exports = TraPaymentModel;
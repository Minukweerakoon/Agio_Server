const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    userid:{
        type: String,
        required: false
    
      },
      title:{
        type: String,
        required: true
    
      },
      submission:{
        type: Date,
        required: true
    
      },
      expiryDate:{
        type: Date,
        required: true
    
      },
      description:{
        type: String,
        required: true
    
      },
      response: [{
        choice: String,
        empId: String,
        createdAt: Date
    }]
})
const AnnCalFormModel = mongoose.model("Notice", userSchema);

module.exports = AnnCalFormModel;
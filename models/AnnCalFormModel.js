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
      date:{
        type: String,
        required: true
    
      },
      description:{
        type: String,
        required: true
    
      }
})
const AnnCalFormModel = mongoose.model("Notice", userSchema);

module.exports = AnnCalFormModel;
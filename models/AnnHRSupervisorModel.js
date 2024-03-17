const mongoose = require('mongoose');
const annSupervisorSchema = new mongoose.Schema(
    {

        userID:{
            type:String,
            required:true

        },
    
        firstName:{
            type:String,
            required:true,
        },
        LastName:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
        },
        phoneNumber:{
            type:String,
            required:true,
        },
        website:{
            type:String,
            required:true,
        },
        specialization:{
            type:String,
            required:true,
        },
        experiance:{
            type:String,
            required:true,
        },
        feePerConsult:{
            type:Number,
            required:true,
        },
        fromTime:{
            type:String,
            required:true,
        }

    }

)
const AnnHRSupervisorModel= mongoose.model("doctors",annSupervisorSchema);
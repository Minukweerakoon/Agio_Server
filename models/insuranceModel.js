const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },  
    file: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "Pending",
    },
    method: {
        type: String,
        default: "Pending",
    },
    insuranceID: {
        type: String,
    }
    }, 
    {
    timestamps: true
    }
);

const insuranceModel = mongoose.model("insurance", userSchema);
module.exports = insuranceModel;
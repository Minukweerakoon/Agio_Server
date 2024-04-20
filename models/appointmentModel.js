const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema(

    {
        userId: {
            type: String,
            required: true,
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        appointmentTime: {
            type:String,
            required: true,
        },
        appointmentNo: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            default: "pending",
        },
        isReminderSet: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

const appointmentModel = mongoose.model("appointments", appointmentSchema);
module.exports = appointmentModel;
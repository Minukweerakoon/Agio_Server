const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username_log: {
        type: String,
        required: true
    },
    empid: {
        type: String,
        required: true
        // Remove unique constraint from empid field
    },
    attendance: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

const attendanceModel = mongoose.model("Attendance", userSchema);
module.exports = attendanceModel;

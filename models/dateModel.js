const mongoose = require("mongoose");

const dateSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    appointmentCount: {
      type: Number,
      required: true,
      default: 0,
    },
    maxAppointmentCount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "available",
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    avgSessionTime: {
      type: Number,
      required: true,
    },
    nextAppointmentTime: {
      type: String,
      required: true,
      default: function(){ return this.startTime}
    },
    nextAppointmentNo: {
      type: Number,
      required: true,
      default: 1,
    },
    appointmentIds: {
      type: [String],
    },
    version: {
      type: Number,
      requierd: true,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const dateModel = mongoose.model("appointmentDates", dateSchema);

module.exports = dateModel;

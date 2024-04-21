const mongoose = require("mongoose");

const parametersSchema = new mongoose.Schema(
  {
    maxAppointments: {
      type: Number,
      required: true,
    },
    avgSessionTime: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const parametersModel = mongoose.model("dateParameters", parametersSchema);

module.exports = parametersModel;

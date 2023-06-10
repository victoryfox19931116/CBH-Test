const mongoose = require("mongoose");

const ShiftSchema = new mongoose.Schema({
  TimeFrom: {
    type: Number,
    required: true,
  },
  TimeTo: {
    type: Number,
    required: true,
  },
  FacilityID: {
    type: String,
    required: true,
  },
  AgnetID: {
    type: String,
    required: true,
  },
  EmployeeName: {
    type: String,
    required: true,
  },
});

const Shift = mongoose.model("Shift", ShiftSchema);

module.exports = Shift;

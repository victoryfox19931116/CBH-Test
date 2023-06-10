const mongoose = require("mongoose");

const FacilitySchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
});

const Facility = mongoose.model("Facility", FacilitySchema);

module.exports = Facility;

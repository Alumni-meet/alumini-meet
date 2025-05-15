const mongoose = require("mongoose");

const PlacementSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  companyImageUrl: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  jobRole: {
    type: String,
    required: true,
    trim: true,
  },
  jobType: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
    trim: true,
  },
  applyLink: {
    type: String,
    required: true,
  },
});


const Placement = mongoose.model("Placement", PlacementSchema);

module.exports = Placement;
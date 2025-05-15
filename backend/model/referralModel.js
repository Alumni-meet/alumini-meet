const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  referraltitle: {
    type: String,
    required: true,
    trim: true,
  },
  jobDescription: {
    type: String,
    required: true,
    trim: true,
  },
  applyLink: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  userName: { type: String, required: true },
});

const Referral = mongoose.model("Referral", referralSchema);

module.exports = Referral;

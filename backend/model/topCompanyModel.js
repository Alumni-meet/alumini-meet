const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  description: { type: String, required: true },
  website: { type: String, required: true },
  alumni: [
    {
      userName: { type: String },
      remarks: { type: String },
    }
  ],
});

module.exports = mongoose.model("Company", companySchema);

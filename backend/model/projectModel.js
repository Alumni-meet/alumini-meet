const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: {type: String},
  projectTitle: { type: String, required: true },
  projectDescription: { type: String, required: true },
  gitLink: { type: String, required: true },
  upiQR: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model('Project', projectSchema);
const mongoose = require("mongoose");

const mentorshipSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  ownerName: { type: String, required: true },
  groupTitle: { type: String, required: true },
  groupDescription: { type: String, required: true },
  followers: {
    type: [String],
    default: [],
  },
  posts: {
    type: [
      {
        likes: {
          type: [String],
          default: [],
          set: function (likes) {
            return Array.from(likes || []);
          },
          get: function (likes) {
            return new Set(likes);
          },
        },
        post: {
          title: String,
          description: String,
          image: {
            data: Buffer,
            contentType: String,
          },
        },
      },
    ],
  },
});

module.exports = mongoose.model("Mentorship", mentorshipSchema);

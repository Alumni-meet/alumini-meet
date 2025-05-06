const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventImg: {
        data: {
            type: Buffer,
            required: true
        },
        contentType: {
            type: String,
            required: true
        }
    },
    postedBy: {
        userName: String,
        trim: true,
    },
    eventTitle: {
        type: String,
        required: true,
        trim: true, 
    },
    eventDescription: {
        type: String,
        required: true,
        trim: true, 
    },
    applyLink: {
        type: String,
        required: true,
        trim: true, 
    },
    postedBy: {
        type: String,
        trim: true
    }
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
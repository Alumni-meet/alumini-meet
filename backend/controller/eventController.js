const Event = require("../model/eventModel");
const {
  createFileUploadMiddleware,
  processUploadedFile,
} = require("../middleware/imageHandler");

// Configure file upload middleware for event images
const handleFileUpload = createFileUploadMiddleware([
  { name: "eventImg", maxCount: 1 },
]);

const addEvent = async (req, res) => {
  try {
    const { eventTitle, eventDescription, applyLink } = req.body;

    const { currentUserName } = req.params;

    const postedBy = currentUserName

    if (!eventTitle || !eventDescription || !applyLink) {
      return res.status(400).json({
        status: "failure",
        message: "All fields (title, description, apply link) are required.",
      });
    }

    // Extract image data
    const eventImg = processUploadedFile(req, "eventImg");

    // Create new event
    const newEvent = !currentUserName
      ? await Event.create({
          eventImg,
          eventTitle,
          eventDescription,
          applyLink,
        })
      : await Event.create({
          eventImg,
          eventTitle,
          eventDescription,
          applyLink,
          postedBy,
        });

    res.status(201).json({
      status: "Success",
      message: "Event added successfully.",
      eventId: newEvent._id,
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "Failed to add event.",
      error: error.message,
    });
  }
};

const editEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventTitle, eventDescription, applyLink } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "failure",
        message: "Event ID is required.",
      });
    }

    if (
      !eventTitle ||
      !eventDescription ||
      !applyLink
    ) {
      return res.status(400).json({
        status: "failure",
        message:
          "All fields (title, description, apply link) are required.",
      });
    }

    const updatedEvent = { eventTitle, eventDescription, applyLink };

    // Handle image update
    const eventImg = processUploadedFile(req, "eventImg");
    if (eventImg) updatedEvent.eventImg = eventImg;

    const result = await Event.findByIdAndUpdate(id, updatedEvent, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).json({
        status: "failure",
        message: "Event not found.",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Event details edited successfully.",
      event: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "Failed to edit event details.",
      error: error.message,
    });
  }
};

const getEventImage = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event || !event.eventImg || !event.eventImg.data) {
      return res.status(404).json({ message: "Event image not found" });
    }

    res.set("Content-Type", event.eventImg.contentType);
    res.send(event.eventImg.data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();

    // Format the events to ensure image data is properly handled
    const formattedEvents = events.map((event) => {
      const eventObj = event.toObject();

      // Convert Buffer to base64 string for the frontend
      if (eventObj.eventImg && eventObj.eventImg.data) {
        eventObj.eventImg.data = eventObj.eventImg.data.toString("base64");
      }

      return eventObj;
    });

    res.status(200).json({
      status: "Success",
      message: "Fetched all events successfully.",
      events: formattedEvents,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: `Cannot fetch events: ${error.message}`,
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        status: "Failure",
        message: "Event not found.",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Event deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: `Event cannot be deleted: ${error.message}`,
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        status: "Failure",
        message: "Event not found",
      });
    }

    // Convert the event to a plain object and format the image data
    const eventObj = event.toObject();
    if (eventObj.eventImg && eventObj.eventImg.data) {
      eventObj.eventImg.data = eventObj.eventImg.data.toString("base64");
    }

    res.status(200).json({
      status: "Success",
      message: "Event fetched successfully",
      event: eventObj,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: `Cannot fetch event: ${error.message}`,
    });
  }
};

module.exports = {
  handleFileUpload,
  addEvent,
  getAllEvents,
  deleteEvent,
  editEvent,
  getEventImage,
  getEventById,
};

const express = require("express");
const {
  handleFileUpload,
  addEvent,
  getAllEvents,
  deleteEvent,
  editEvent,
  getEventImage, // Ensure this function exists in eventController.js
} = require("../controller/eventController");

const router = express.Router();

// Routes
router.get("/getAllEvents", getAllEvents);
router.post("/addEvent", handleFileUpload, addEvent);
router.post("/addEvent/:currentUserName", handleFileUpload, addEvent);
router.put("/editEvent/:id", handleFileUpload, editEvent);
router.delete("/deleteEvent/:id", deleteEvent);
router.get("/getEventImage/:eventId", getEventImage);

module.exports = router;

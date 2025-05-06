const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  registerAdmin,
  sendOTP,
  verifyOTP,
  validateUser,
  updateProfile,
  getUserById,
  getUserByUserName
} = require("../controller/userController");

// Route to send OTP
router.post("/sendOTP", sendOTP);

// Route to verify OTP and register user, with optional image upload
router.post("/verifyOTP", upload.single("userImg"), verifyOTP);

// Route to validate user login
router.post("/validateUser", validateUser);

// Route to update user profile
router.put("/updateProfile/:userId", upload.single("userImg"), updateProfile);

// Route to get user by ID
router.get("/getUser/:userId", getUserById);

// Route to register admin
router.post("/registerAdmin", registerAdmin);

router.get("/getUserByUserName/:userName", getUserByUserName)

module.exports = router;

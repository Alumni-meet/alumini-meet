const User = require("../model/userModel");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// In-memory store for OTPs (use Redis in production)
const otpStore = new Map();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP to user's email
const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "failed",
        message: "User already exists.",
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const timestamp = Date.now();

    // Store OTP with email and timestamp (valid for 10 minutes)
    otpStore.set(email, { otp, timestamp });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Registration",
      text: `Your OTP is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.status(500).json({
          status: "failure",
          message: "Failed to send OTP.",
        });
      }
      res.status(200).json({
        status: "success",
        message: "OTP sent to email.",
      });
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `Error sending OTP: ${error.message}`,
    });
  }
};

const verifyOTP = async (req, res) => {
  const { code, ...userData } = req.body;
  const email = userData.email;

  try {
    // Check if OTP exists and is valid
    const storedOtp = otpStore.get(email);
    if (!storedOtp || storedOtp.otp !== code) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid OTP.",
      });
    }

    // Check OTP expiration (10 minutes)
    if (Date.now() - storedOtp.timestamp > 600000) {
      otpStore.delete(email);
      return res.status(400).json({
        status: "failure",
        message: "OTP expired.",
      });
    }

    // Check if user exists again (prevent race condition)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "failed",
        message: "User already exists.",
      });
    }

    // Create new user, include userImg if provided
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      gender: userData.gender,
      phoneNumber: userData.phone,
      role: userData.role,
      batch: userData.batch,
      dept: userData.dept,
      // Optional userImg field
      userImg: req.file
        ? { data: req.file.buffer, contentType: req.file.mimetype }
        : undefined,
    });

    otpStore.delete(email);

    const userDetail = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      userId: user._id,
      role: user.role,
      dept: user.dept,
      batch: user.batch,
      bio: user.bio,
      github: user.github,
      companyName: user.companyName,
      twitter: user.twitter,
      linkedIn: user.linkedIn,
    };

    res.status(200).json({
      status: "Success",
      message: "User registered successfully.",
      userDetail: userDetail,
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `Registration failed: ${error.message}`,
    });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { ...userData } = req.body;
    User.create(userData);
    res.status(200).json({
      status: "Success",
      message: "Admin registered successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `Registration failed: ${error.message}`,
    });
  }
};

// Validate user login
const validateUser = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    if (!user) {
      return res.status(400).json({
        status: "failure",
        message: "User does not exist.",
      });
    }

    const userDetail = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      userId: user._id,
      role: user.role,
      dept: user.dept,
      batch: user.batch,
      bio: user.bio,
      github: user.github,
      companyName: user.companyName,
      twitter: user.twitter,
      linkedIn: user.linkedIn,
    };

    res.status(200).json({
      status: "success",
      message: "User logged in successfully.",
      userDetail: userDetail,
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `No user found: ${error.message}`,
    });
  }
};

// Update user profile (with optional image upload)
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    // Prepare update object from request body
    const updatedProfile = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      dept: req.body.dept,
      batch: req.body.batch,
      gender: req.body.gender,
      phoneNumber: req.body.phoneNumber,
      bio: req.body.bio,
      linkedIn: req.body.linkedIn,
      github: req.body.github,
      twitter: req.body.twitter,
      companyName: req.body.companyName,
    };

    // Parse skills and interests from JSON strings
    if (req.body.skills) {
      try {
        updatedProfile.skills = JSON.parse(req.body.skills);
      } catch (error) {
        console.error("Error parsing skills:", error);
        updatedProfile.skills = [];
      }
    }

    if (req.body.interests) {
      try {
        updatedProfile.interests = JSON.parse(req.body.interests);
      } catch (error) {
        console.error("Error parsing interests:", error);
        updatedProfile.interests = [];
      }
    }

    // If an image is uploaded, add userImg field
    if (req.file) {
      updatedProfile.userImg = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "failure",
        message: "User not found.",
      });
    }

    // Check if email is being updated and if it already exists
    const email = req.body.email;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email: req.body.email,
        _id: { $ne: req.params.id },
      });
      if (emailExists) {
        return res.status(400).json({
          status: "failure",
          message: "Email ID already present.",
        });
      }
    }

    await User.findByIdAndUpdate(userId, updatedProfile, { new: true });
    res.status(200).json({
      status: "Success",
      message: "Profile updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `Profile cannot be updated: ${error.message}`,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const _id = userId;
    const userDetails = await User.findById(_id);
    if (!userDetails) {
      return res.status(404).json({
        status: "failure",
        message: "User not found.",
      });
    }
    res.status(200).json({
      status: "Success",
      message: "User fetched successfully.",
      userDetail: userDetails,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: `Cannot get user: ${e.message}`,
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  validateUser,
  updateProfile,
  getUserById,
  registerAdmin,
};

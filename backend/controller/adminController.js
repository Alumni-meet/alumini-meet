const User = require("../model/userModel");

const dotenv = require("dotenv");

dotenv.config();

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json({
      status: "Success",
      message: "fetched all users successfully.",
      users: allUsers,
    });
  } catch (error) {
    res.status(400).json({
      status: "failure",
      message: "cannot able to fetch users.",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "Success",
      message: `user deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `user cannot be deleted ${error}`,
    });
  }
};

module.exports = { getAllUsers, deleteUser };

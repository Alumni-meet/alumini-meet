const express = require("express");
const { upload } = require("../controller/mentorshipController"); // Import multer instance
const {
  AddGroup,
  EditGroup,
  GetAllGroup,
  GetGroupByUserId,
  ToggleFollow,
  GetFollowedGroups,
  DeleteGroup,
  AddPost,
  EditPost,
  DeletePost
} = require("../controller/mentorshipController");

const router = express.Router();

/** ----------------- MENTORSHIP GROUP ROUTES ----------------- */
router.post("/add", upload.single("file"), AddGroup);
router.patch("/update/:id", EditGroup);
router.get("/getAll", GetAllGroup);
router.get("/get/:userId", GetGroupByUserId);
router.get("/followed/:userId", GetFollowedGroups);
router.delete("/delete/:id", DeleteGroup);

/** ---------------------- FOLLOW ROUTE ---------------------- */
router.post("/follow/:groupId/:userName", ToggleFollow);

/** ---------------------- POSTS ROUTES ---------------------- */
router.post("/:groupId/addPost", upload.single("file"), AddPost);
router.post("/:groupId/updatePost/:postIndex", upload.single("file"), EditPost);
router.delete("/:groupId/deletePost/:postIndex", DeletePost);

module.exports = router;

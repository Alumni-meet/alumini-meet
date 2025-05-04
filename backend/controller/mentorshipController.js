const Mentorship = require("../model/mentorshipModel");
const multer = require("multer");

// Multer configuration to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

/** ----------------------- MENTORSHIP GROUP MANAGEMENT ----------------------- **/

// Add a new mentorship group with an initial post
async function AddGroup(req, res) {
  try {
    const { userId, groupTitle, groupDescription, title, description } = req.body;

    // Validate required fields
    if (!userId || !groupTitle || !groupDescription) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newMentorship = new Mentorship({
      userId,
      groupTitle,
      groupDescription,
      posts: req.file
        ? [
            {
              post: {
                title,
                description,
                image: {
                  data: req.file.buffer,
                  contentType: req.file.mimetype,
                },
              },
            },
          ]
        : [],
    });

    await newMentorship.save();
    res.status(201).json({ message: "Mentorship group created successfully", newMentorship });
  } catch (error) {
    res.status(500).json({ message: "Failed to create mentorship group", error: error.message });
  }
}

// Edit an existing mentorship group (title, description)
async function EditGroup(req, res) {
  try {
    const { id } = req.params;
    const { groupTitle, groupDescription } = req.body;

    const updatedMentorship = await Mentorship.findByIdAndUpdate(
      id,
      { groupTitle, groupDescription },
      { new: true }
    );

    if (!updatedMentorship) {
      return res.status(404).json({ message: "Mentorship group not found" });
    }

    res.json({ message: "Mentorship group updated successfully", updatedMentorship });
  } catch (error) {
    res.status(500).json({ message: "Failed to edit mentorship group", error: error.message });
  }
}

// Get all mentorship groups
async function GetAllGroup(req, res) {
  try {
    const mentorshipGroups = await Mentorship.find();
    res.json({ message: "Mentorship groups fetched successfully", mentorshipGroups });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch mentorship groups", error: error.message });
  }
}

// Get mentorship groups by userId
async function GetGroupByUserId(req, res) {
  try {
    const { userId } = req.params;
    const mentorshipGroups = await Mentorship.find({ userId: userId });

    if (mentorshipGroups.length === 0) {
      return res.status(200).json({ message: "No mentorship groups found for this user" });
    }

    res.json({ message: "Mentorship groups fetched successfully", mentorshipGroups });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch mentorship groups", error: error.message });
  }
}

// Delete a mentorship group by ID
async function DeleteGroup(req, res) {
  try {
    const deletedMentorship = await Mentorship.findByIdAndDelete(req.params.id);
    if (!deletedMentorship) {
      return res.status(404).json({ message: "Mentorship group not found" });
    }
    res.json({ message: "Mentorship group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete mentorship group", error: error.message });
  }
}

/** ----------------------- POSTS MANAGEMENT ----------------------- **/

// Add a new post to an existing mentorship group
async function AddPost(req, res) {
  try {
    const { groupId } = req.params;
    const { title, description } = req.body;

    const mentorship = await Mentorship.findById(groupId);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship group not found" });
    }

    const newPost = {
      post: {
        title,
        description,
        image: req.file
          ? {
              data: req.file.buffer,
              contentType: req.file.mimetype,
            }
          : null,
      },
    };

    mentorship.posts.push(newPost);
    await mentorship.save();

    res.status(201).json({ message: "Post added successfully", mentorship });
  } catch (error) {
    res.status(500).json({ message: "Failed to add post", error: error.message });
  }
}

// Edit an existing post inside a mentorship group
async function EditPost(req, res) {
  try {
    const { groupId, postIndex } = req.params;
    const { title, description } = req.body;

    const mentorship = await Mentorship.findById(groupId);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship group not found" });
    }

    const index = parseInt(postIndex);
    if (index >= mentorship.posts.length) {
      return res.status(400).json({ message: "Invalid post index" });
    }

    const post = mentorship.posts[index];

    post.post.title = title || post.post.title;
    post.post.description = description || post.post.description;

    if (req.file) {
      post.post.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await mentorship.save();
    res.json({ message: "Post updated successfully", updatedPost: post });
  } catch (error) {
    res.status(500).json({ message: "Failed to edit post", error: error.message });
  }
}


// Delete a post from a mentorship group
async function DeletePost(req, res) {
  try {
    const { groupId, postIndex } = req.params;

    // Convert postIndex to a number
    const index = parseInt(postIndex, 10);
    if (isNaN(index)) {
      return res.status(400).json({ message: "Invalid post index" });
    }

    const mentorship = await Mentorship.findById(groupId);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship group not found" });
    }

    // Check if index is within valid range
    if (index < 0 || index >= mentorship.posts.length) {
      return res.status(400).json({ message: "Post index out of range" });
    }

    // Remove the post using splice
    mentorship.posts.splice(index, 1);
    await mentorship.save();

    res.json({ message: "Post deleted successfully", mentorship });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
}


async function GetFollowedGroups(req, res) {
  try {
    const { userId } = req.params;

    // Find groups where the user is in the followers array
    const followedGroups = await Mentorship.find({ followers: userId });

    if (followedGroups.length === 0) {
      return res.status(200).json({ message: "No followed mentorship groups found." });
    }

    res.json(followedGroups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function ToggleFollow(req, res) {
  try {
    const { groupId, userName } = req.params;

    const mentorship = await Mentorship.findById(groupId);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship group not found" });
    }

    // Check if user is already following
    const isFollowing = mentorship.followers.includes(userId);

    if (isFollowing) {
      // Unfollow: Remove user from followers
      mentorship.followers = mentorship.followers.filter((id) => id !== userId);
    } else {
      // Follow: Add user to followers
      mentorship.followers.push(userName);
    }

    await mentorship.save();

    res.json({
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      mentorship,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


module.exports = {
  AddGroup,
  EditGroup,
  GetAllGroup,
  GetGroupByUserId,
  DeleteGroup,
  AddPost,
  EditPost,
  DeletePost,
  GetFollowedGroups,
  ToggleFollow,
  upload, // Export multer instance
};

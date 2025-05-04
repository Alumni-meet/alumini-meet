import axios from "axios";
import { useEffect, useState } from "react";
import "./style/Mentor.css";
import { mainUrlPrefix } from "../main";

// Helper function to convert an array of numbers to a base64 string
function arrayBufferToBase64(buffer: number[]): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

interface Follower {
  _id: string;
  name: string;
  dept: string;
  batch: string;
}

interface Group {
  userName: string;
  _id: string;
  groupTitle: string;
  groupDescription: string;
  userId: string;
  followers: string[];
  posts: {
    _id: string;
    post: {
      title: string;
      description: string;
      image?: {
        data: number[];
        contentType: string;
      };
    };
  }[];
}

const FollowersDialog = ({
  groupId,
  onClose,
}: {
  groupId: string;
  onClose: () => void;
}) => {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await axios.get(
          `${mainUrlPrefix}/mentorship/followers/${groupId}`
        );
        setFollowers(response.data);
      } catch (error) {
        console.error("Error fetching followers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchFollowers();
    }
  }, [groupId]);

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <dialog
        open
        className="mentor-dialog-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div onClick={onClose} style={{cursor: "pointer", width: "100%", position: "sticky", top: "0"}}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#222"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
        </div>
        <div className="dialog-header">
          <h2>Followers</h2>
        </div>
        <div className="followers-list">
          {loading ? (
            <p>Loading followers...</p>
          ) : followers.length > 0 ? (
            followers.map((follower) => (
              <div key={follower._id} className="follower-item">
                <h3>{follower.name}</h3>
                <p>Department: {follower.dept}</p>
                <p>Batch: {follower.batch}</p>
              </div>
            ))
          ) : (
            <p>No followers yet</p>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default function Mentorship() {
  const [community, setCommunity] = useState<Group[]>([]);
  const [following, setFollowing] = useState<Group[]>([]);
  const userId = sessionStorage.getItem("user")!;
  const role = sessionStorage.getItem("role")!;
  const [currentPage, setCurrentPage] = useState("explore");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);

  // Post State
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Group creation state
  const [groupTitle, setGroupTitle] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [image] = useState<File | null>(null);
  const [postIndex, setPostIndex] = useState<number>(-1);

  async function fetchGroups() {
    try {
      let url = "";
      if (currentPage === "explore") url = `${mainUrlPrefix}/mentorship/getAll`;
      else if (currentPage === "yours")
        url = `${mainUrlPrefix}/mentorship/get/${userId}`;
      else if (currentPage === "following")
        url = `${mainUrlPrefix}/mentorship/followed/${userId}`;

      const response = await axios.get(url);
      if (currentPage === "following") {
        setFollowing(response.data);
      } else {
        setCommunity(response.data.mentorshipGroups);
      }
      if (response.data.message == "No mentorship groups found for this user") {
        setCommunity([]);
      }
    } catch (e) {
      console.error("Error fetching mentorship groups:", e);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, [currentPage]);

  const toggleFollow = async (userName: string,groupId: string) => {
    try {
      await axios.post(
        `${mainUrlPrefix}/mentorship/follow/${groupId}/${userName}`
      );
      fetchGroups();
    } catch (error) {
      console.error("Error following/unfollowing group:", error);
    }
  };

  const handleAddCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("groupTitle", groupTitle);
    formData.append("groupDescription", groupDescription);
    if (image) formData.append("image", image);

    try {
      await axios.post(`${mainUrlPrefix}/mentorship/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowAddForm(false);
      fetchGroups();
    } catch (error) {
      console.error("Error adding mentorship group:", error);
    }
  };

  const handleAddPost = async (e: React.FormEvent, groupId: string) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", postTitle);
    formData.append("description", postDescription);
    if (postImage) {
      formData.append("file", postImage);
    }

    try {
      await axios.post(
        `${mainUrlPrefix}/mentorship/${groupId}/addPost`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setShowPostForm(false);
      setPostTitle("");
      setPostDescription("");
      setPostImage(null);
      fetchGroups();
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const handleEditPost = async (
    e: React.FormEvent,
    groupId: string,
    postIndex: number
  ) => {
    try {
      e.preventDefault();
      const formData = new FormData();
      formData.append("title", postTitle);
      formData.append("description", postDescription);
      if (postImage) {
        formData.append("file", postImage);
      }
      await axios.post(
        `${mainUrlPrefix}/mentorship/${groupId}/updatePost/${postIndex}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setShowPostForm(false);
      setPostTitle("");
      setPostDescription("");
      setPostImage(null);
      setEditingPost(null);
      fetchGroups();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async (postIndex: string, groupId: string) => {
    try {
      await axios.delete(
        `${mainUrlPrefix}/mentorship/${groupId}/deletePost/${postIndex}`
      );
      fetchGroups();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPostImage(e.target.files[0]);
    }
  };

  return (
    <div className="mentor-body">
      <div className="tabs">
        <button
          className={`tab ${currentPage === "explore" ? "active" : ""}`}
          onClick={() => setCurrentPage("explore")}
        >
          Explore
        </button>
        <button
          className={`tab ${currentPage === "following" ? "active" : ""}`}
          onClick={() => setCurrentPage("following")}
        >
          Following
        </button>
        {role === "alumini" && (
          <button
            className={`tab ${currentPage === "yours" ? "active" : ""}`}
            onClick={() => setCurrentPage("yours")}
          >
            Yours
          </button>
        )}
      </div>
      <div>
        {currentPage === "yours" && role === "alumini" && (
          <button
            onClick={() => setShowAddForm(true)}
            className="add-community"
          >
            Add Community
          </button>
        )}
      </div>
      {/* Explore Section */}
      {currentPage === "explore" && (
        <div className="mentor-content-page">
          {community.length > 0 ? (
            community.map((group: Group) => (
              <div
                key={group._id}
                className="mentorship-card"
                onClick={() => setSelectedGroup(group)}
                title={group.groupTitle}
              >
                <div className="nameHolder">
                  <h2>{group.groupTitle}</h2>
                  <p>{group.groupDescription}</p>
                  <p>
                    <strong>Followers: </strong>
                    {group.followers.length}
                  </p>
                </div>
                <button
                  className="follow-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(group.userName,  group._id);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#fff"
                    className={
                      group.followers.includes(userId)
                        ? "svgFollow"
                        : "svgUnfollow"
                    }
                  >
                    <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <p>No mentorship groups found.</p>
          )}
        </div>
      )}

      {/* Following Section */}
      {currentPage === "following" && (
        <div className="mentor-content-page">
          {following.length > 0 ? (
            following.map((group: Group) => (
              <div
                key={group._id}
                className="mentorship-card"
                onClick={() => setSelectedGroup(group)}
                title={group.groupTitle}
              >
                <div className="nameHolder">
                  <h2>{group.groupTitle}</h2>
                  <p>{group.groupDescription}</p>
                  <p>
                    <strong>Followers: </strong>
                    {group.followers.length}
                  </p>
                </div>
                <button
                  className="follow-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(group._id);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#fff"
                    className={
                      group.followers.includes(userId)
                        ? "svgFollow"
                        : "svgUnfollow"
                    }
                  >
                    <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <p>You are not following any mentorship groups.</p>
          )}
        </div>
      )}

      {/* Yours Section */}
      {currentPage === "yours" && (
        <div className="mentor-content-page">
          {showAddForm && (
            <div
              className="dialog-overlay"
              onClick={() => setShowAddForm(false)}
            >
              <dialog
                open={showAddForm}
                className="mentor-dialog-box"
                onClick={(e) => e.stopPropagation()}
              >
                <form
                  onSubmit={handleAddCommunity}
                  className="add-community-form"
                >
                  <h3>Create a Mentorship Group</h3>
                  <input
                    type="text"
                    placeholder="Group Title"
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Group Description"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    required
                  ></textarea>
                  <button type="submit">Add Group</button>
                  <button type="button" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                </form>
              </dialog>
            </div>
          )}
          {community.length > 0 ? (
            community.map((group: Group) => (
              <div
                key={group._id}
                className="mentorship-card"
                onClick={() => setSelectedGroup(group)}
              >
                <div className="nameHolder">
                  <h2>{group.groupTitle}</h2>
                  <p>{group.groupDescription}</p>
                  <p>
                    <strong>Followers: </strong>
                    {group.followers.length}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>You have no mentorship groups yet.</p>
          )}
        </div>
      )}

      {/* Expanded Group View */}
      {selectedGroup && (
        <div className="dialog-overlay" onClick={() => setSelectedGroup(null)}>
          <dialog
            className="mentor-dialog-box"
            open={true}
            onClick={(e) => e.stopPropagation()}
          >
            <div onClick={() => setSelectedGroup(null)} style={{cursor: "pointer", width: "100%", position: "sticky", top: "0"}}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#222"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
            </div>
            <div className="post-top-bar">
              <div>
                <h2>{selectedGroup.groupTitle}</h2>
                <p>{selectedGroup.groupDescription}</p>
                <div
                  className="followers-clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFollowersDialog(true);
                  }}
                >
                  Followers: {selectedGroup.followers.length}
                </div>
              </div>
              {role === "alumini" && selectedGroup.userId === userId && (
                <button
                  onClick={() => setShowPostForm(true)}
                  title="Add post"
                  className="addPost"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#000"
                  >
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h360v80H200v560h560v-360h80v360q0 33-23.5 56.5T760-120H200Zm120-160v-80h320v80H320Zm0-120v-80h320v80H320Zm0-120v-80h320v80H320Zm360-80v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" />
                  </svg>
                </button>
              )}
            </div>
            {selectedGroup.posts && selectedGroup.posts.length > 0 ? (
              selectedGroup.posts.map((post: any, index: number) => (
                <div key={post._id} className="post-card">
                  {post.post.image && post.post.image.data && (
                    <img
                      src={`data:${
                        post.post.image.contentType
                      };base64,${arrayBufferToBase64(
                        post.post.image.data.data
                      )}`}
                      alt="Post"
                    />
                  )}
                  <div className="post-content">
                    <h1>{post.post.title.toUpperCase()}</h1>
                    <p>{post.post.description}</p>
                  </div>
                  {role === "alumini" && selectedGroup.userId === userId && (
                    <div className="post-actions">
                      <button
                        title="Edit the post"
                        onClick={() => {
                          setEditingPost(post);
                          setPostTitle(post.post.title);
                          setPostDescription(post.post.description);
                          setShowPostForm(true);
                          setPostIndex(index);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#e3e3e3"
                        >
                          <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                        </svg>
                      </button>
                      <button
                        title="Delete the post"
                        onClick={() =>
                          handleDeletePost(post._id, selectedGroup._id)
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#e3e3e3"
                        >
                          <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No posts yet.</p>
            )}
          </dialog>
        </div>
      )}

      {/* Followers Dialog */}
      {showFollowersDialog && selectedGroup && (
        <FollowersDialog
          groupId={selectedGroup._id}
          onClose={() => setShowFollowersDialog(false)}
        />
      )}

      {/* Add/Edit Post Modal */}
      {showPostForm && (
        <div className="dialog-overlay">
          <dialog open={showPostForm} className="dialog-box">
            <form
              onSubmit={
                editingPost
                  ? (e) => handleEditPost(e, selectedGroup!._id, postIndex)
                  : (e) => handleAddPost(e, selectedGroup!._id)
              }
              className="post-form"
            >
              <h3>{editingPost ? "Edit Post" : "Add Post"}</h3>
              <div className="form-inputs">
                <input
                  type="text"
                  placeholder="Post Title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Post Description"
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  required
                ></textarea>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="form-actions">
                <button type="submit">
                  {editingPost ? "Update Post" : "Add Post"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPostForm(false);
                    setEditingPost(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
}

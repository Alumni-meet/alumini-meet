import axios from "axios";
import { useEffect, useState } from "react";
import "../style/Mentor.css";
import { mainUrlPrefix } from "../../main";

function arrayBufferToBase64(buffer: number[]): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

interface Group {
  _id: string;
  groupTitle: string;
  ownerName: string;
  groupDescription: string;
  userId: string;
  followers: string[];
  posts: {
    _id: string;
    post: {
      title: string;
      description: string;
      image?: {
        data: number[] | any;
        contentType: string;
      };
    };
  }[];
}

export default function ContentModeration() {
  const [community, setCommunity] = useState<Group[]>([]);
  const [currentPage, ] = useState("explore");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postIndex, ] = useState<number>(-1);

  async function fetchGroups() {
    try {
      const response = await axios.get(`${mainUrlPrefix}/mentorship/getAll`);
      setCommunity(response.data.mentorshipGroups);
    } catch (e) {
      console.error("Error fetching mentorship groups:", e);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, [currentPage]);

  const handleAddPost = async (e: React.FormEvent, groupId: string) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", postTitle);
    formData.append("description", postDescription);
    if (postImage) formData.append("file", postImage);

    try {
      await axios.post(
        `${mainUrlPrefix}/mentorship/${groupId}/addPost`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      resetPostForm();
      fetchGroups();
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const handleEditPost = async (
    e: React.FormEvent,
    groupId: string,
    index: number
  ) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", postTitle);
    formData.append("description", postDescription);
    if (postImage) formData.append("file", postImage);

    try {
      await axios.post(
        `${mainUrlPrefix}/mentorship/${groupId}/updatePost/${index}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      resetPostForm();
      fetchGroups();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async (postId: string, groupId: string) => {
    try {
      await axios.delete(
        `${mainUrlPrefix}/mentorship/${groupId}/deletePost/${postId}`
      );
      fetchGroups();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setPostImage(e.target.files[0]);
  };

  const resetPostForm = () => {
    setShowPostForm(false);
    setPostTitle("");
    setPostDescription("");
    setPostImage(null);
    setEditingPost(null);
  };

  return (
    <div className="mentor-body">
      <div className="mentor-content-page">
        {community.length > 0 ? (
          community.map((group) => (
            <div
              key={group._id}
              className="mentorship-card"
              onClick={() => setSelectedGroup(group)}
            >
              <div className="nameHolder">
                <h2>{group.groupTitle}</h2>
                <p>by {group.ownerName}</p>
                <p>{group.groupDescription}</p>
                <p>
                  <strong>Followers:</strong> {group.followers.length}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No mentorship groups found.</p>
        )}
      </div>

      {selectedGroup && (
        <div className="dialog-overlay" onClick={() => setSelectedGroup(null)}>
          <dialog
            className="mentor-dialog-box"
            open
            onClick={(e) => e.stopPropagation()}
          >
            <div className="post-top-bar">
              <div>
                <h2>{selectedGroup.groupTitle}</h2>
                <p>{selectedGroup.groupDescription}</p>
              </div>
            </div>
            {selectedGroup.posts.length > 0 ? (
              selectedGroup.posts.map((post) => (
                <div key={post._id} className="post-card">
                  {post.post.image?.data && (
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
                  <div className="post-actions">
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
                </div>
              ))
            ) : (
              <p>No posts yet.</p>
            )}
          </dialog>
        </div>
      )}

      {showPostForm && (
        <div className="dialog-overlay">
          <dialog open className="dialog-box">
            <form
              onSubmit={(e) =>
                editingPost
                  ? handleEditPost(e, selectedGroup!._id, postIndex)
                  : handleAddPost(e, selectedGroup!._id)
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
                <button type="button" onClick={resetPostForm}>
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

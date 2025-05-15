import { useEffect, useState, ChangeEvent, KeyboardEvent } from "react";
import axios from "axios";
import "./style/Profile.css";
import { mainUrlPrefix } from "../main";

interface User {
  userName: string,
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dept: string;
  gender: string;
  phoneNumber: number;
  skills: string[];
  bio: string;
  linkedIn: string;
  github: string;
  twitter: string;
  interests: string[];
  companyName: string;
  batch: number;
  role: string;
  userImg?:
    | string
    | {
        data: number[];
        contentType: string;
      };
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState<string>("");
  const [newSkill, setNewSkill] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const userId = sessionStorage.getItem("user");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!userId) throw new Error("User not authenticated");

        const response = await axios.get(
          `${mainUrlPrefix}/user/getUser/${userId}`
        );
        console.log("Raw API Response:", response.data);

        const updatedUser = response.data.userDetail;
        console.log("User Image Data:", updatedUser.userImg);

        setUser(updatedUser);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load profile"
        );
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);
  const getImageUrl = (userData: User | null) => {
    if (!userData) return "";
    
    // If userImg is undefined, return default image
    if (!userData.userImg) {
      return "https://static.vecteezy.com/system/resources/thumbnails/036/280/651/small_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
    }

    // If userImg is already a string (URL or data URL), return it directly
    if (typeof userData.userImg === "string") {
      // Check if it's already a data URL
      if (userData.userImg.startsWith("data:")) {
        return userData.userImg;
      }
      // Check if it's a base64 string without the data URL prefix
      if (/^[A-Za-z0-9+/=]+$/.test(userData.userImg)) {
        return `data:image/jpeg;base64,${userData.userImg}`;
      }
      // Otherwise, assume it's a regular URL
      return userData.userImg;
    }

    // If userImg is an object with data and contentType
    if (userData.userImg && Array.isArray(userData.userImg.data)) {
      try {
        const uint8Array = new Uint8Array(userData.userImg.data);
        const base64String = btoa(
          uint8Array.reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        return `data:${userData.userImg.contentType};base64,${base64String}`;
      } catch (error) {
        console.error("Error processing image data:", error);
      }
    }

    // Return default image if no valid image data
    return "https://static.vecteezy.com/system/resources/thumbnails/036/280/651/small_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
  };

  // Open edit dialog
  const openEditDialog = () => {
    if (user) {
      setFormData({
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dept: user.dept,
        bio: user.bio,
        linkedIn: user.linkedIn,
        github: user.github,
        twitter: user.twitter,
        companyName: user.companyName,
        batch: user.batch,
      });

      // Deduplicate and initialize chips
      setInterests([...new Set(user.interests)]);
      setSkills([...new Set(user.skills)]);
      setIsEditDialogOpen(true);
    }
  };

  // Handle input change
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle adding interest
  const handleAddInterest = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newInterest.trim()) {
      e.preventDefault();
      setInterests((prev) => [...prev, newInterest.trim()]);
      setNewInterest("");
    }
  };

  // Handle adding skill
  const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSkill.trim()) {
      e.preventDefault();
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  // Remove interest
  const removeInterest = (index: number) => {
    setInterests((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove skill
  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle profile edit submission
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) throw new Error("User not found");
      const data = new FormData();
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
  
      // Append skills and interests as JSON strings
      data.append("skills", JSON.stringify(skills));
      data.append("interests", JSON.stringify(interests));
  
      // Append file if selected
      if (selectedFile) {
        data.append("userImg", selectedFile);
      }
  
      // Use PUT instead of POST to match your backend route
      await axios.put(`${mainUrlPrefix}/user/updateProfile/${userId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Refetch user data to update the UI
      const fetchResponse = await axios.get(
        `${mainUrlPrefix}/user/getUser/${userId}`
      );
      const updatedUser = fetchResponse.data;
  
      setUser(updatedUser);
      setIsEditDialogOpen(false);
      setError("");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Error updating profile");
      } else {
        setError("Error updating profile");
      }
    }
  };

  // Render loading/error/no-data states
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="no-data">No user data found</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Profile Image */}
        <img
          src={getImageUrl(user)}
          alt={`logged in as ${user.role === "user" ? "student" : user.role}`}
          className="profile-img"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src =
              "https://static.vecteezy.com/system/resources/thumbnails/036/280/651/small_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
          }}
        />
        {/* Profile Details */}
        <h1 className="home-title">{`${user.firstName} ${user.lastName}`}</h1>
        <h3><b>User Name  : </b>{user.userName}</h3>
        <p className="email-id">Email: {user.email}</p>
        <p className="education">
          <b>Education:</b> {user.dept}, {user.batch}
        </p>
        <div className="bio">
          <b>Bio:</b> {user.bio || "No bio available"}
        </div>

        {/* Skills */}
        <div className="skills-section">
          <h3>Skills</h3>
          <div className="skills">
            {user.skills?.map((skill, index) => (
              <div className="chip" key={index}>
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="social-links">
          <h3>Social Links</h3>
          <div className="links">
            {user.linkedIn && (
              <a href={user.linkedIn} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
            {user.twitter && (
              <a href={user.twitter} target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="interests-section">
          <h3>Interests</h3>
          <div className="chip">
            {user.interests?.map((interest, index) => (
              <div className="interest" key={index}>
                {interest}
              </div>
            ))}
          </div>
        </div>

        {/* Company Name */}
        {user.companyName && (
          <div className="company">
            <b>Company:</b> {user.companyName}
          </div>
        )}

        {/* Edit Button */}
        <button className="edit-btn" onClick={openEditDialog}>
          Edit Profile
        </button>
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div
          className="dialog-overlay"
          onClick={() => setIsEditDialogOpen(false)}
        >
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleEdit}>
              {/* First Name */}
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Department */}
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="dept"
                  value={formData.dept || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Bio */}
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* LinkedIn */}
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="text"
                  name="linkedIn"
                  value={formData.linkedIn || ""}
                  onChange={handleInputChange}
                />
              </div>

              {/* GitHub */}
              <div className="form-group">
                <label>GitHub</label>
                <input
                  type="text"
                  name="github"
                  value={formData.github || ""}
                  onChange={handleInputChange}
                />
              </div>

              {/* Twitter */}
              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter || ""}
                  onChange={handleInputChange}
                />
              </div>

              {/* Interests */}
              <div className="form-group">
                <label>Interests</label>
                <div className="chip-input">
                  <div className="chip-container">
                    {interests.map((interest, index) => (
                      <div key={index} className="chip">
                        {interest}
                        <span
                          className="close-chip"
                          onClick={() => removeInterest(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="16px"
                            viewBox="0 -960 960 960"
                            width="16px"
                            fill="royalblue"
                          >
                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                          </svg>
                        </span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type interest and press Enter"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleAddInterest}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="form-group">
                <label>Skills</label>
                <div className="chip-input">
                  <div className="chip-container">
                    {skills.map((skill, index) => (
                      <div key={index} className="chip">
                        {skill}
                        <span
                          className="close-chip"
                          onClick={() => removeSkill(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="16px"
                            viewBox="0 -960 960 960"
                            width="16px"
                            fill="royalblue"
                          >
                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                          </svg>
                        </span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type skill and press Enter"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleInputChange}
                />
              </div>

              {/* Batch */}
              <div className="form-group">
                <label>Batch</label>
                <input
                  type="number"
                  name="batch"
                  value={formData.batch || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Profile Image */}
              <div className="form-group">
                <label>Profile Image (optional)</label>
                <input
                  type="file"
                  name="userImg"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {/* Submit Buttons */}
              <div className="form-actions">
                <button type="submit">Save Changes</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setFormData({});
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

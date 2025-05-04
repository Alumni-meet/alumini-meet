import {
  useEffect,
  useState,
  ChangeEvent,
  KeyboardEvent,
  FormEvent,
} from "react";
import axios from "axios";
import "./style/Profile.css";
import { mainUrlPrefix } from "../main";

interface User {
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
    | {
        data: string; // base64 string
        contentType: string;
      }
    | string; // or direct URL string
}

const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/thumbnails/036/280/651/small_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const userId = sessionStorage.getItem("user");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!userId) throw new Error("User not authenticated");
        setLoading(true);
        const response = await axios.get(
          `${mainUrlPrefix}/user/getUser/${userId}`
        );
        // Handle both response structures
        const userData = response.data.userDetail || response.data;
        if (!userData) throw new Error("No user data received");
        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  const getImageUrl = (userData: User | null): string => {
    if (!userData?.userImg) return DEFAULT_AVATAR;
    // If userImg is already a URL string
    if (typeof userData.userImg === "string") {
      return userData.userImg.startsWith("http")
        ? userData.userImg
        : DEFAULT_AVATAR;
    }
    // If userImg is an object with data and contentType
    if (userData.userImg.data && userData.userImg.contentType) {
      return `data:${userData.userImg.contentType};base64,${userData.userImg.data}`;
    }
    return DEFAULT_AVATAR;
  };

  const openEditDialog = () => {
    if (user) {
      setFormData({
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
      setInterests([...new Set(user.interests || [])]);
      setSkills([...new Set(user.skills || [])]);
      setIsEditDialogOpen(true);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleAddInterest = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newInterest.trim()) {
      e.preventDefault();
      setInterests((prev) => [...prev, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSkill.trim()) {
      e.preventDefault();
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeInterest = (index: number) => {
    setInterests((prev) => prev.filter((_, i) => i !== index));
  };

  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !userId) return;
    try {
      const data = new FormData();
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
      // Append arrays
      data.append("skills", JSON.stringify(skills));
      data.append("interests", JSON.stringify(interests));
      // Append file if selected
      if (selectedFile) {
        data.append("userImg", selectedFile);
      }
      await axios.put(`${mainUrlPrefix}/user/updateProfile/${userId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Refetch updated data
      const response = await axios.get(
        `${mainUrlPrefix}/user/getUser/${userId}`
      );
      setUser(response.data.userDetail || response.data);
      setIsEditDialogOpen(false);
      setError("");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    }
  };

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
          style={{ width: "200px", borderRadius: "100%" }}
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
        />
        {/* Profile Details */}
        <h1 className="profile-name">{`${user.firstName} ${user.lastName}`}</h1>
        <p className="email-id">{user.email}</p>
        <p className="education">
          <b>Education:</b> {user.dept}, {user.batch}
        </p>
        <div className="bio">
          <b>Bio:</b> {user.bio || "No bio available"}
        </div>
        {/* Skills */}
        <div className="skills-section">
          <h3>Skills</h3>
          <div className="chip-container">
            {user.skills.map((skill, index) => (
              <div key={index} className="chip">
                {skill}
                <span
                  className="close-chip"
                  onClick={() => removeSkill(index)}
                ></span>
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
          <div className="chip-container">
            {user.interests.map((interest, index) => (
              <div key={index} className="chip">
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
                    {interests.map((i, index) => (
                      <div key={index} className="chip">
                        {i}
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

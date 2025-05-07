import { useState, useEffect } from "react";
import axios from "axios";
import './style/UserManagement.css';
import { mainUrlPrefix } from "../../main";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department: string;
  gender: string;
  phoneNumber: string;
  skills?: string;
  bio?: string;
  linkedIn?: string;
  github?: string;
  twitter?: string;
  interests?: string;
  companyName?: string;
  batch: string;
  role: "admin" | "user" | "alumini";
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"user" | "alumini">("user");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${mainUrlPrefix}/admin/getAllUsers`);
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => user.role === activeTab);

  const handleSave = async () => {
    if (!selectedUser) return;

    const updatedUser: any = { ...selectedUser };
    delete updatedUser.userImg;

    try {
      await axios.post(
        `${mainUrlPrefix}/user/updateProfile/${updatedUser._id}`,
        updatedUser
      );
      setUsers(
        users.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${mainUrlPrefix}/admin/deleteUser/${id}`);
      setUsers(users.filter((user) => user._id !== id));
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="user-management-body">
      <h2 className="user-title">User Management</h2>

      <div className="user-tab-head">
        {["user", "alumini"].map((role) => (
          <button
            key={role}
            className={`tab-button ${activeTab === role ? "activeTab" : ""}`}
            onClick={() => setActiveTab(role as "user" | "alumini")}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      {/* User List */}
      <div className="user-list-container">
        {filteredUsers.length === 0 ? (
          <p>No {activeTab} users found.</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr className="table-header">
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="table-row">
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleEdit(user)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {isModalOpen && selectedUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit User</h3>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={selectedUser.firstName}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, firstName: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={selectedUser.lastName}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, lastName: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={selectedUser.password}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, password: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={selectedUser.department}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, department: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={selectedUser.gender}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, gender: e.target.value })
                  }
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={selectedUser.phoneNumber}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Skills</label>
                <input
                  type="text"
                  value={selectedUser.skills || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, skills: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={selectedUser.bio || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, bio: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="text"
                  value={selectedUser.linkedIn || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, linkedIn: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>GitHub</label>
                <input
                  type="text"
                  value={selectedUser.github || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, github: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="text"
                  value={selectedUser.twitter || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, twitter: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Interests</label>
                <input
                  type="text"
                  value={selectedUser.interests || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, interests: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={selectedUser.companyName || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, companyName: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Batch</label>
                <input
                  type="text"
                  value={selectedUser.batch}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, batch: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value as "admin" | "user" | "alumini" })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="alumini">Alumini</option>
                </select>
              </div>
              <div className="modal-actions">
                <button onClick={handleSave} className="save-button">
                  Save
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
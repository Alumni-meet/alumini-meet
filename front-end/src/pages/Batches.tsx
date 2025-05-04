import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./style/Batches.css";
import { mainUrlPrefix } from "../main";


export default function Batches() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<
    "all" | "name" | "dept" | "email" | "phone" | "linkedin" | "twitter"
  >("all");

  // Fetch all users on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${mainUrlPrefix}/admin/getAllUsers`);
        if (response.data?.users) {
          setAllUsers(response.data.users);
        } else {
          setError("No users found in the response.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  // Memoized filtered users for better performance
  const filteredUsers:any = useMemo(() => {
    if (!selectedBatch) return [];

    // First filter by batch
    const batchUsers = allUsers.filter(
      (user: any) => user.batch == selectedBatch
    );
    if (!searchTerm.trim()) return batchUsers;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return batchUsers.filter((user: any) => {
      // Helper function to check if a field exists and matches search term
      const fieldMatches = (fieldValue: string | number | undefined) => {
        if (!fieldValue) return false;
        return fieldValue.toString().toLowerCase().includes(lowerSearchTerm);
      };

      switch (filterField) {
        case "all":
          return (
            fieldMatches(user.firstName) ||
            fieldMatches(user.lastName) ||
            fieldMatches(user.dept) ||
            fieldMatches(user.email) ||
            fieldMatches(user.phoneNumber) ||
            fieldMatches(user.linkedIn) ||
            fieldMatches(user.twitter)
          );
        case "name":
          return fieldMatches(user.firstName) || fieldMatches(user.lastName);
        case "dept":
          return fieldMatches(user.dept);
        case "email":
          return fieldMatches(user.email);
        case "phone":
          return fieldMatches(user.phoneNumber);
        case "linkedin":
          return fieldMatches(user.linkedIn);
        case "twitter":
          return fieldMatches(user.twitter);
        default:
          return true;
      }
    });
  }, [allUsers, selectedBatch, searchTerm, filterField]);

  const handleBatchClick = (batch: string) => {
    setSelectedBatch(batch);
    setIsDialogOpen(true);
    setSearchTerm("");
    setFilterField("all");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedBatch("");
    setSearchTerm("");
    setFilterField("all");
  };

  return (
    <div className="batches-body">
      <ul id="batches">
        {Array.from({ length: 16 }, (_, index) => {
          const year = 2015 + index;
          return (
            <li key={year}>
              <button onClick={() => handleBatchClick(`${year}`)}>
                Batch of {year}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Dialog Box */}
      {isDialogOpen && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div
            className="batch-dialog-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              onClick={handleCloseDialog}
              style={{
                cursor: "pointer",
                width: "100%",
                position: "sticky",
                top: "0",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#fff"
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </div>
            <div className="dialog-header">
              <h2 className="batch-selected-year">Batch of {selectedBatch}</h2>
              <div className="search-controls">
                <select
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value as any)}
                  className="filter-select"
                >
                  <option value="all">All Fields</option>
                  <option value="name">Name</option>
                  <option value="dept">Department</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                </select>
                <input
                  type="text"
                  placeholder={`Search by ${
                    filterField === "all" ? "any field" : filterField
                  }...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {loading ? (
              <p>Loading users...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : filteredUsers.length === 0 ? (
              <p>
                No users found{" "}
                {searchTerm.trim() ? "matching your search" : "for this batch"}.
              </p>
            ) : (
              <>
                <ul className="user-list">
                  {filteredUsers.map((user: any) => (
                    <li key={user._id} className="user-item">
                      {user.userImg && (
                        <img
                          src={`data:${user.userImg.contentType};base64,${user.userImg.data}`}
                        />
                      )}
                      <p>
                        <strong>Name:</strong> {user.firstName} {user.lastName}
                      </p>
                      <p>
                        <strong>Department:</strong> {user.dept}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Contact:</strong> {user.phoneNumber}
                      </p>
                      {user.linkedIn && (
                        <p>
                          <strong>LinkedIn:</strong>{" "}
                          <a
                            href={user.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {user.linkedIn}
                          </a>
                        </p>
                      )}
                      {user.twitter && (
                        <p>
                          <strong>Twitter:</strong>{" "}
                          <a
                            href={user.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {user.twitter}
                          </a>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

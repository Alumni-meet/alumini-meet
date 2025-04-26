import { useEffect, useState } from "react";
import { mainUrlPrefix } from "../main";
import axios from "axios";
import "./style/TopCompanies.css";

interface Company {
  _id: string;
  name: string;
  logo: string;
  description: string;
  website: string;
  alumni: {
    _id: string;
    remarks: string;
  }[];
}

export default function TopCompanies() {
  // Retrieve user data from sessionStorage
  const userId = sessionStorage.getItem("user") || "";
  const alumniCompany = sessionStorage.getItem("company") || "";
  const role = sessionStorage.getItem("role") || "";

  // State management
  const [companies, setCompanies] = useState<Company[]>([]);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [activeFormCompanyId, setActiveFormCompanyId] = useState<string | null>(
    null,
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Unknown");

  // Fetch companies on component mount
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await axios.get(`${mainUrlPrefix}/top-companies/`);
        setCompanies(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to load companies. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  // Fetch user name based on userId
  useEffect(() => {
    if (userId) {
      async function fetchUserName() {
        try {
          const response = await axios.get(
            `${mainUrlPrefix}/user/getUser/${userId}`,
          );
          setUserName(response.data.userDetail.firstName);
        } catch (error) {
          console.error("Error fetching user name:", error);
          setError("Failed to fetch user name. Please try again.");
        }
      }

      fetchUserName();
    }
  }, [userId]);

  // Handle comment submission (create or update)
  const handleCommentSubmission = async (
    companyId: string,
    e: React.FormEvent,
  ) => {
    e.preventDefault();
    const remarkText = remarks[companyId]?.trim();
    if (!remarkText) return;

    try {
      // Check if the user already has a comment
      const existingComment = companies
        .find((c) => c._id === companyId)
        ?.alumni.find((alum) => alum._id === userId);

      if (existingComment) {
        // Update existing comment via PUT
        await axios.put(
          `${mainUrlPrefix}/top-companies/${companyId}/alumni/${userId}`,
          { remarks: remarkText },
        );
      } else {
        // Create new comment via POST
        await axios.post(`${mainUrlPrefix}/top-companies/${companyId}/alumni`, {
          user: userId,
          remarks: remarkText,
        });
      }

      // Refresh companies
      setRemarks((prev) => ({ ...prev, [companyId]: "" }));
      setActiveFormCompanyId(null);
      const updatedCompanies = await axios.get(
        `${mainUrlPrefix}/top-companies/`,
      );
      setCompanies(updatedCompanies.data);
    } catch (error) {
      console.error("Error handling comment:", error);
      setError("Failed to submit comment. Please try again.");
    }
  };

  // Check if user can comment on a company
  const canComment = (companyName: string) => {
    return (
      role.toLowerCase() === "alumini" && // Keep "alumini" as requested
      alumniCompany.toLowerCase() === companyName.toLowerCase()
    );
  };

  // Check if user has already commented on a company
  const hasCommented = (company: Company) => {
    return company.alumni.some((alum) => alum._id === userId);
  };

  const selectedCompany = companies.find((c) => c._id === selectedCompanyId);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="top-companies-container">
      {error && <div className="error-message">{error}</div>}
      <div className="companies-grid">
        {companies.map((company) => (
          <div key={company._id} className="company-card">
            <img
              src={company.logo}
              alt={company.name}
              className="company-logo"
            />
            <h2>{company.name}</h2>
            <div className="company-description-container">
                <p className="company-description">{company.description}</p>
                <div className="top-company-actions">
                {company.description && (
                  <button onClick={() => setSelectedCompanyId(company._id)}>
                    Know More
                  </button>
                )}
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="top-company-link"
                >
                  Visit Website
                  <svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 -960 960 960" fill="#fff"><path d="m136-240-56-56 296-298 160 160 208-206H640v-80h240v240h-80v-104L536-320 376-480 136-240Z"/></svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedCompany && (
        <div
          className="dialog-overlay"
          onClick={() => setSelectedCompanyId(null)}
        >
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedCompany.name}</h3>
            <div className="description-content">
              {selectedCompany.description
                .split(/\r?\n/)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
            <div className="alumni-section">
              <h4>Alumni Remarks</h4>
              {selectedCompany.alumni.length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                <div className="comments-grid">
                  {selectedCompany.alumni.map((alum, index) => (
                    <div key={index} className="comment-card">
                      <div className="comment-header">
                        <div className="user-info">
                          <strong>{userName}</strong>
                        </div>
                        <div className="comment-actions">
                          {userId === alum._id && (
                            <>
                              <button
                                className="edit-btn"
                                onClick={() => {
                                  setRemarks({
                                    ...remarks,
                                    [selectedCompany._id]: alum.remarks,
                                  });
                                  setActiveFormCompanyId(selectedCompany._id);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="delete-btn"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this comment?",
                                    )
                                  ) {
                                    try {
                                      await axios.delete(
                                        `${mainUrlPrefix}/top-companies/${selectedCompany._id}/alumni/${alum._id}`,
                                      );
                                      const updatedCompanies = await axios.get(
                                        `${mainUrlPrefix}/top-companies/`,
                                      );
                                      setCompanies(updatedCompanies.data);
                                    } catch (error) {
                                      console.error(
                                        "Error deleting comment:",
                                        error,
                                      );
                                      setError(
                                        "Failed to delete comment. Please try again.",
                                      );
                                    }
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="comment-content">{alum.remarks}</div>
                    </div>
                  ))}
                </div>
              )}
              {canComment(selectedCompany.name) &&
                !hasCommented(selectedCompany) && (
                  <>
                    <button
                      onClick={() =>
                        setActiveFormCompanyId(
                          activeFormCompanyId === selectedCompany._id
                            ? null
                            : selectedCompany._id,
                        )
                      }
                      className="add-company-btn"
                    >
                      {activeFormCompanyId === selectedCompany._id
                        ? "Close"
                        : "Add Comment"}
                    </button>
                    {activeFormCompanyId === selectedCompany._id && (
                      <div className="form-modal">
                        <div className="form-content">
                          <h2>Add Remark</h2>
                          <form
                            onSubmit={(e) =>
                              handleCommentSubmission(selectedCompany._id, e)
                            }
                          >
                            <textarea
                              placeholder="Add your remark..."
                              value={remarks[selectedCompany._id] || ""}
                              onChange={(e) =>
                                setRemarks({
                                  ...remarks,
                                  [selectedCompany._id]: e.target.value,
                                })
                              }
                              required
                            />
                            <div className="form-buttons">
                              <button type="submit">Submit</button>
                              <button
                                type="button"
                                onClick={() => setActiveFormCompanyId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

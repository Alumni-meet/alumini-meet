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
    userName: string; // Ensure this matches the model
    remarks: string;
  }[];
}

export default function TopCompanies() {
  // Retrieve user data from sessionStorage
  const userName = sessionStorage.getItem("userName") || "Unknown"; // Directly get from storage
  const alumniCompany = sessionStorage.getItem("company") || "";
  const role = sessionStorage.getItem("role") || "";

  // State management
  const [companies, setCompanies] = useState<Company[]>([]);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [activeFormCompanyId, setActiveFormCompanyId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies on mount
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await axios.get<Company[]>(`${mainUrlPrefix}/top-companies/`);
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

  // Handle comment submission (create or update)
  const handleCommentSubmission = async (companyId: string, e: React.FormEvent) => {
    e.preventDefault();
    const remarkText = remarks[companyId]?.trim();
    if (!remarkText) return;
    try {
      // Check existing comment by userName
      const existingComment = companies.find(c => c._id === companyId)?.alumni.find(a => a.userName === userName);
      
      if (existingComment) {
        // Update using userName in URL
        await axios.put(
          `${mainUrlPrefix}/top-companies/${companyId}/alumni/${userName}`,
          { remarks: remarkText }
        );
      } else {
        // Create new comment with userName
        await axios.post(
          `${mainUrlPrefix}/top-companies/${companyId}/alumni`,
          { userName, remarks: remarkText }
        );
      }
      
      // Refresh companies
      const updatedCompanies = await axios.get<Company[]>(`${mainUrlPrefix}/top-companies/`);
      setCompanies(updatedCompanies.data);
      setRemarks(prev => ({ ...prev, [companyId]: "" }));
      setActiveFormCompanyId(null);
    } catch (error) {
      console.error("Error handling comment:", error);
      setError("Failed to submit comment. Please try again.");
    }
  };

  // Check if user has already commented
  const hasCommented = (company: Company) => {
    return company.alumni.some(alum => alum.userName === userName);
  };

  // Check comment eligibility
  const canComment = (companyName: string) => {
    return role.toLowerCase() === "alumini" && alumniCompany.toLowerCase() === companyName.toLowerCase();
  };

  // Handle delete comment
  const deleteComment = async (companyId: string, alumUserName: string) => {
    try {
      if (window.confirm("Are you sure you want to delete this comment?")) {
        await axios.delete(
          `${mainUrlPrefix}/top-companies/${companyId}/alumni/${alumUserName}`
        );
        const updatedCompanies = await axios.get<Company[]>(`${mainUrlPrefix}/top-companies/`);
        setCompanies(updatedCompanies.data);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setError("Comment deletion failed");
    }
  };

  const selectedCompany = companies.find(c => c._id === selectedCompanyId);

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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1rem"
                    viewBox="0 -960 960 960"
                    fill="#fff"
                  >
                    <path d="m136-240-56-56 296-298 160 160 208-206H640v-80h240v240h-80v-104L536-320 376-480 136-240Z" />
                  </svg>
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
            <div
              onClick={() => setSelectedCompanyId(null)}
              style={{
                cursor: "pointer",
                width: "100%",
                position: "sticky",
                top: "0",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#222"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
            </div>
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
                    <div key={index} className="alumni-comment-card">
                      <div className="comment-header">
                        <div className="user-info">
                          <strong>{alum.userName}</strong>
                        </div>
                        <div className="comment-actions">
                          {userName === alum.userName && (
                            <div className="form-actions">
                              {/* <button
                                onClick={() => {
                                  setRemarks({
                                    ...remarks,
                                    [selectedCompany._id]: alum.remarks,
                                  });
                                  setActiveFormCompanyId(selectedCompany._id);
                                }}
                              >
                                Edit
                              </button> */}
                              <button
                              style={{background: "none"}}
                              title="Delete the remark"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this comment?"
                                    )
                                  ) {
                                    try {
                                      await axios.delete(
                                        `${mainUrlPrefix}/top-companies/${selectedCompany._id}/alumni/${alum.userName}`
                                      );
                                      const updatedCompanies = await axios.get<Company[]>(`${mainUrlPrefix}/top-companies/`);
                                      setCompanies(updatedCompanies.data);
                                    } catch (error) {
                                      console.error(
                                        "Error deleting comment:",
                                        error
                                      );
                                      setError(
                                        "Failed to delete comment. Please try again."
                                      );
                                    }
                                  }
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="red"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                              </button>
                            </div>
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
                            : selectedCompany._id
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
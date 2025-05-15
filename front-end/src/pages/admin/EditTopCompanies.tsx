import React, { useState, useEffect } from "react";
import axios from "axios";
import { mainUrlPrefix } from "../../main";
import "./style/EditTopCompanies.css";

interface Alumni {
  _id: string;
  user: string;
  remarks: string;
  userName: string;
}

interface Company {
  _id: string;
  name: string;
  logo: string;
  description: string;
  website: string;
  alumni: Alumni[];
}

export default function EditTopCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const token = sessionStorage.getItem("token") || "";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${mainUrlPrefix}/top-companies`);
      setCompanies(res.data);
    } catch (err: any) {
      setError(
        "Failed to load data: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = formData._id
        ? `${mainUrlPrefix}/top-companies/${formData._id}`
        : `${mainUrlPrefix}/top-companies`;
      const method = formData._id ? "put" : "post";

      const { data } = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompanies((prev) =>
        formData._id
          ? prev.map((c) => (c._id === data._id ? data : c))
          : [...prev, data],
      );

      setFormData({});
      setSuccessMessage(
        `Company ${formData._id ? "updated" : "added"} successfully!`,
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(
        "Operation failed: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;
    setLoading(true);
    try {
      await axios.delete(`${mainUrlPrefix}/top-companies/${id}`);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
      setSuccessMessage("Company deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchData()
    } catch (err: any) {
      setError(
        "Delete failed: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (companyId: string, alumniId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.delete(
        `${mainUrlPrefix}/top-companies/${companyId}/admin-delete/${alumniId}`
      );
  
      if (response.data.status === "success") {
        setCompanies(prev =>
          prev.map(company =>
            company._id === companyId
              ? {
                  ...company,
                  alumni: company.alumni.filter(a => a._id !== alumniId),
                }
              : company
          )
        );
        setSuccessMessage("Comment deleted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to delete comment");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete comment"
      );
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage("");
        setError("");
      }, 3000);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="edit-top-companies-container">
      <h1>Manage Top Companies</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {/* Company Form */}
      <div className="add-company-section">
        <h2>{formData._id ? "Edit Company" : "Add New Company"}</h2>
        <form onSubmit={handleFormSubmit} className="company-form">
          {["name", "logo", "description", "website"].map((field) => (
            <div key={field} className="form-group">
              <label htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </label>
              {field === "description" ? (
                <textarea
                  id={field}
                  required
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              ) : (
                <input
                  id={field}
                  required
                  type={field === "website" ? "url" : "text"}
                  value={formData[field as keyof Company]?.toString() || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                />
              )}
            </div>
          ))}

          <div className="form-buttons">
            <button type="submit" className="save-btn">
              {formData._id ? "Update" : "Add"} Company
            </button>
            {formData._id && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setFormData({})}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Company List */}
      <div className="companies-list">
        <h2>Existing Companies</h2>
        {companies.length === 0 ? (
          <p>No companies found. Add your first company above.</p>
        ) : (
          <div className="companies-grid">
            {companies.map((company) => (
              <div key={company._id} className="company-card">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="company-logo"
                />
                <h3>{company.name}</h3>
                <p className="company-description">{company.description}</p>
                <div className="company-actions">
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    Visit Website
                  </a>

                  <div className="admin-controls">
                    <button title="Edit" onClick={() => setFormData(company)}>
                      ✏️
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDelete(company._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <button
                  className="view-comments-btn"
                  onClick={() =>
                    setSelectedCompany(
                      selectedCompany?._id === company._id ? null : company,
                    )
                  }
                >
                  {selectedCompany?._id === company._id
                    ? "Hide Comments"
                    : "View Comments"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Box */}
      {selectedCompany && (
        <div
          className="dialog-overlay"
          onClick={() => setSelectedCompany(null)}
        >
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-dialog-btn"
              onClick={() => setSelectedCompany(null)}
            >
              &times;
            </button>
            <h4>Alumni Comments for {selectedCompany.name}</h4>
            {selectedCompany.alumni.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              <div className="comments-list">
                {selectedCompany.alumni.map((alumni) => (
                  <div key={alumni._id} className="comment-card">
                    <p className="comment-text">{alumni.userName}</p>
                    <p className="comment-text">"{alumni.remarks}"</p>
                    <button
                      className="delete-comment-btn"
                      onClick={() =>
                        handleDeleteComment(selectedCompany._id, alumni._id)
                      }
                    >
                      🗑️ Delete Comment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

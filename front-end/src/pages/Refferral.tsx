import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "./style/Projects.css";
import { mainUrlPrefix } from "../main";

interface Refferal {
  _id: string;
  referraltitle: string;
  jobDescription: string;
  applyLink: string;
  userId: string;
}

export default function Referrals() {
  const userId = sessionStorage.getItem("user")!;
  const role = sessionStorage.getItem("role")!;
  const [tab, setTab] = useState("Explore");
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReferral, setSelectedReferral] = useState<Refferal | null>(
    null
  );
  const [addReferralForm, setAddReferralForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Refferal | null>(null);
  const [formData, setFormData] = useState({
    referraltitle: "",
    jobDescription: "",
    applyLink: "",
  });

  // Open description dialog
  const openDescriptionDialog = (referral: Refferal) => {
    setSelectedReferral(referral);
  };

  // Close description dialog
  const closeDescriptionDialog = () => {
    setSelectedReferral(null);
  };

  // Fetch referrals based on the selected tab
  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint = "";
      if (tab === "Explore") {
        endpoint = `${mainUrlPrefix}/referral/getAllReferrals`;
      } else if (tab === "Yours") {
        endpoint = `${mainUrlPrefix}/referral/getUserReferrals/${userId}`;
      }

      const response = await axios.get(endpoint);

      if (response.data.status === "Success") {
        // Set referrals to the array from the response, or empty array if none
        setReferrals(
          tab === "Explore"
            ? response.data.referral || []
            : response.data.referrals || []
        );
      } else {
        // Only set error for actual errors, not for empty results
        setError(response.data.message);
      }
    } catch (err: any) {
      console.error("Failed to fetch referrals:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to fetch referrals. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  // Handle input changes for the add/edit form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new referral
  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        referraltitle: formData.referraltitle,
        jobDescription: formData.jobDescription,
        applyLink: formData.applyLink,
      };
      const response = await axios.post(
        `${mainUrlPrefix}/referral/addReferral/${userId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.status === "Success") {
        setAddReferralForm(false);
        setFormData({ referraltitle: "", jobDescription: "", applyLink: "" });
        fetchReferrals();
      }
    } catch (error) {
      console.error("Failed to add referral:", error);
    }
  };

  // Delete a referral
  const handleDeleteReferral = async (referralId: string) => {
    try {
      await axios.delete(
        `${mainUrlPrefix}/referral/deleteReferral/${referralId}`
      );
      fetchReferrals();
    } catch (error) {
      console.error("Failed to delete referral:", error);
    }
  };

  // Edit a referral (using PATCH)
  const handleEditReferral = async (e: React.FormEvent, referralId: string) => {
    e.preventDefault();
    try {
      const payload = {
        referraltitle: formData.referraltitle,
        jobDescription: formData.jobDescription,
        applyLink: formData.applyLink,
      };
      const response = await axios.patch(
        `${mainUrlPrefix}/referral/editReferral/${referralId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.status === "Success") {
        setEditingReferral(null);
        setAddReferralForm(false);
        setFormData({ referraltitle: "", jobDescription: "", applyLink: "" });
        fetchReferrals();
      }
    } catch (error) {
      console.error("Failed to edit referral:", error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="projects-container">
      {/* Tabs for Explore and Yours */}
      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === "Explore" ? "active" : ""}`}
          onClick={() => setTab("Explore")}
        >
          Explore
        </button>
        {role === "alumini" && (
          <button
            type="button"
            className={`tab ${tab === "Yours" ? "active" : ""}`}
            onClick={() => setTab("Yours")}
          >
            Yours
          </button>
        )}
      </div>

      {/* For alumni, show add referral button in the "Yours" tab */}
      {role === "alumini" && tab === "Yours" && (
        <button
          type="button"
          className="add-project-btn"
          onClick={() => {
            setAddReferralForm(true);
            setEditingReferral(null);
            setFormData({
              referraltitle: "",
              jobDescription: "",
              applyLink: "",
            });
          }}
        >
          Add Referral
        </button>
      )}

      <div className="projects-grid">
        {referrals.length === 0 ? (
          <div className="no-referrals-message">
            <p>No referrals found.</p>
          </div>
        ) : (
          referrals.map((referral: Refferal) => (
            <div key={referral._id} className="project-card">
              <h3>{referral.referraltitle}</h3>
              <div className="referral-description">
                <p className="truncated">{referral.jobDescription}</p>
                {referral.jobDescription.length > 150 && (
                  <button
                    className="read-more-btn"
                    onClick={() => openDescriptionDialog(referral)}
                  >
                    Read More
                  </button>
                )}
              </div>
              <a
                href={referral.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="know-more-btn"
              >
                <p>Referral Link</p>
              </a>
              {/* Show edit and delete if the referral belongs to the current alumni */}
              {role === "alumini" && referral.userId === userId && (
                <div className="post-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReferral(referral);
                      setFormData({
                        referraltitle: referral.referraltitle,
                        jobDescription: referral.jobDescription,
                        applyLink: referral.applyLink,
                      });
                      setAddReferralForm(true);
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
                    type="button"
                    onClick={() => handleDeleteReferral(referral._id)}
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
        )}
      </div>

      {/* Description Dialog */}
      {selectedReferral && (
        <div
          className="dialog-overlay"
          onClick={() => closeDescriptionDialog()}
        >
          <div className="dialog-box">
            <div className="dialog-header">
              <h2 className="refferalHeader">
                {selectedReferral.referraltitle}
              </h2>
            </div>
            <div className="dialog-content">
              <div className="full-description">
                <p>{selectedReferral.jobDescription}</p>
              </div>
              <a
                href={selectedReferral.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="know-more-btn"
              >
                Referral Link
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Referral */}
      {addReferralForm && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <form
              className="post-form"
              onSubmit={(e) => {
                if (editingReferral) {
                  handleEditReferral(e, editingReferral._id);
                } else {
                  handleAddReferral(e);
                }
              }}
            >
              <div className="referal-inputs">
                <h2>
                  {editingReferral ? "Edit Referral" : "Add New Referral"}
                </h2>
                <input
                  type="text"
                  name="referraltitle"
                  placeholder="Referral Title"
                  value={formData.referraltitle}
                  onChange={handleInputChange}
                  required
                />
                <textarea
                  name="jobDescription"
                  placeholder="Referral Description"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
                <input
                  type="url"
                  name="applyLink"
                  placeholder="Referral Link"
                  value={formData.applyLink}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="btn-grp">
                <button type="submit" className="submit-btn">
                  {editingReferral ? "Update Referral" : "Add Referral"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setAddReferralForm(false);
                    setEditingReferral(null);
                    setFormData({
                      referraltitle: "",
                      jobDescription: "",
                      applyLink: "",
                    });
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

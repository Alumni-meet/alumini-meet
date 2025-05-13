import { useEffect, useState } from "react";
import axios from "axios";
import "./style/Placement.css";
import { mainPythonUrl, mainUrlPrefix } from "../main";

interface Ats {
  ats_score: string;
  missing_keywords: string[];
}

interface Placement {
  _id: string;
  companyImageUrl: string;
  companyName: string;
  jobRole: string;
  jobType: string;
  location: string;
  jobDescription: string;
  applyLink: string;
}

export default function Placement() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [atsResult, setAtsResult] = useState<Ats | null>(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingAts, setIsLoadingAts] = useState(false);
  const [currentJd, setCurrentJd] = useState("");
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");

  useEffect(() => {
    const fetchAllPlacements = async () => {
      try {
        const response = await axios.get(
          `${mainUrlPrefix}/placement/getAllPlacement`,
        );
        setPlacements(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching placements:", error);
        setError("Failed to load placements. Please try again later.");
        setLoading(false);
      }
    };

    fetchAllPlacements();
  }, []);

  const handleFileChange = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAtsCheck = async () => {
    if (!selectedFile) {
      return alert("Please select a resume file first");
    }

    setIsLoadingAts(true);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("job_description", currentJd);

      const response = await axios.post(`${mainPythonUrl}/ats-score`, formData);
      setAtsResult(response.data);
    } catch (error) {
      console.error("ATS Check Error:", error);
      alert("Error checking resume. Please try again.");
    } finally {
      setIsLoadingAts(false);
    }
  };

  const openDialog = (jd: string) => {
    setCurrentJd(jd);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setAtsResult(null);
    setSelectedFile(null);
  };

  const truncateDescription = (description: string) => {
    return {
      truncated:
        description.length > 150
          ? description.substring(0, 150) + "..."
          : description,
      isTruncated: description.length > 150,
    };
  };

  const handleReadMore = (e: React.MouseEvent, description: string) => {
    e.stopPropagation();
    setSelectedDescription(description);
    setShowDescriptionDialog(true);
  };

  const handleCloseDescriptionDialog = () => {
    setShowDescriptionDialog(false);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (placements.length === 0)
    return <div className="no-data">No placements found.</div>;

  return (
    <div className="placement-container">
      <div className="placements-grid">
        {placements.map((placement: Placement) => (
          <div key={placement._id} className="placement-card">
            <img
              src={
                placement.companyImageUrl || "https://via.placeholder.com/150"
              }
              alt={`${placement.companyName} logo`}
              className="company-logo"
            />
            <h2>{placement.companyName}</h2>
            <p>
              <strong>Role:</strong> {placement.jobRole}
            </p>
            <p>
              <strong>Type:</strong> {placement.jobType}
            </p>
            <p>
              <strong>Location:</strong> {placement.location}
            </p>
            <div className="company-description-container">
              <div className="company-description">
                {truncateDescription(placement.jobDescription).truncated}
              </div>
              {truncateDescription(placement.jobDescription).isTruncated && (
                <button
                  className="read-more-btn"
                  onClick={(e) => handleReadMore(e, placement.jobDescription)}
                >
                  Read more...
                </button>
              )}
            </div>
            <div className="placement-user-actions">
              <button
                className="ats-btn"
                onClick={() => openDialog(placement.jobDescription)}
              >
                ATS
              </button>
              <a
                href={placement.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="apply-btn"
              >
                Apply Now
              </a>
            </div>
          </div>
        ))}
      </div>

      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-content">
          <div
            onClick={closeDialog}
            style={{
              cursor: "pointer",
              width: "100%",
              position: "sticky",
              top: "0",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#222"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
          </div>
            <h2>Check Resume Fit</h2>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            {isLoadingAts ? (
              <div className="loader">Loading...</div>
            ) : (
              atsResult && (
                <div className="ats-result">
                  <p className="atsScore">
                    <b>Score:</b>{" "}
                    <span className="atsScoreForResume">
                      {atsResult.ats_score}
                    </span>
                  </p>
                </div>
              )
            )}
            <div className="dialog-actions">
              <button
                onClick={handleAtsCheck}
                disabled={!selectedFile || isLoadingAts}
              >
                Check ATS Score
              </button>
              <button onClick={closeDialog}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showDescriptionDialog && (
        <div className="dialog-overlay" onClick={handleCloseDescriptionDialog}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
          <div
            onClick={handleCloseDescriptionDialog}
            style={{
              cursor: "pointer",
              width: "100%",
              position: "sticky",
              top: "0",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#222"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
          </div>
            <h3>Job Description</h3>
            <div className="description-content">
              {selectedDescription.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <button onClick={handleCloseDescriptionDialog}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

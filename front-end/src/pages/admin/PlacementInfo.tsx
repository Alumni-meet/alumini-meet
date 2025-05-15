import { useEffect, useState } from "react";
import axios from "axios";
import "./style/PlacementInfo.css";
import { mainUrlPrefix } from "../../main";

interface Placement {
  _id?: string;
  companyName: string;
  jobRole: string;
  jobType: string;
  location: string;
  applyLink: string;
  companyImageUrl: string;
  jobDescription: string;
}

export default function PlacementInfo() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(
    null,
  );
  const [showDescriptionDialog, setShowDescriptionDialog] = useState<boolean>(false);
  const [selectedDescription, setSelectedDescription] = useState<string>("");
  const [formPlacement, setFormPlacement] = useState<Placement>({
    companyName: "",
    jobRole: "",
    jobType: "",
    location: "",
    applyLink: "",
    companyImageUrl: "",
    jobDescription: "",
  });

  useEffect(() => {
    const fetchAllPlacements = async () => {
      try {
        const response = await axios.get<Placement[]>(
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

  const handleAddOrUpdatePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlacement) {
        // Editing existing placement
        await axios.patch(
          `${mainUrlPrefix}/placement/editPlacement/${editingPlacement._id}`,
          formPlacement,
        );
        setPlacements((prev) =>
          prev.map((p) =>
            p._id === editingPlacement._id ? { ...p, ...formPlacement } : p,
          ),
        );
        alert("Placement updated successfully!");
      } else {
        // Adding new placement
        const response = await axios.post<Placement>(
          `${mainUrlPrefix}/placement/addPlacement`,
          formPlacement,
        );
        setPlacements([...placements, response.data]);
        alert("Placement added successfully!");
      }

      setIsDialogOpen(false);
      setEditingPlacement(null);
      resetForm();
    } catch (error) {
      console.error("Error saving placement:", error);
      alert("Failed to save placement. Please try again.");
    }
  };

  const handleDeletePlacement = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this placement?")) return;

    try {
      await axios.delete(`${mainUrlPrefix}/placement/deletePlacement/${id}`);
      setPlacements(placements.filter((placement) => placement._id !== id));
      alert("Placement deleted successfully!");
    } catch (error) {
      console.error("Error deleting placement:", error);
      alert("Failed to delete placement. Please try again.");
    }
  };

  const openEditDialog = (placement: Placement) => {
    setEditingPlacement(placement);
    setFormPlacement(placement);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormPlacement({
      companyName: "",
      jobRole: "",
      jobType: "",
      location: "",
      applyLink: "",
      companyImageUrl: "",
      jobDescription: "",
    });
  };

  const truncateDescription = (description: string) => {
    return {
      truncated: description.length > 150 ? description.substring(0, 150) + '...' : description,
      isTruncated: description.length > 150
    };
  };

  const handleReadMore = (e: React.MouseEvent, description: string) => {
    e.stopPropagation(); // Prevent card click event
    setSelectedDescription(description);
    setShowDescriptionDialog(true);
  };

  const handleCloseDescriptionDialog = () => {
    setShowDescriptionDialog(false);
  };

  return (
    <div className="placement-container">
      <button
        className="add-placement-btn"
        onClick={() => setIsDialogOpen(true)}
      >
        Add Placement
      </button>

      <div className="placements-grid">
        {placements.map((placement) => (
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
            <div className="form-actions">
              <button onClick={() => openEditDialog(placement)}>Edit</button>
              <button onClick={() => handleDeletePlacement(placement._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h2>{editingPlacement ? "Edit Placement" : "Add New Placement"}</h2>
            <form onSubmit={handleAddOrUpdatePlacement}>
              <label>
                <p>Company Name:</p>
                <input
                  type="text"
                  value={formPlacement.companyName}
                  onChange={(e) =>
                    setFormPlacement({
                      ...formPlacement,
                      companyName: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label>
                <p>Job Role:</p>
                <input
                  type="text"
                  value={formPlacement.jobRole}
                  onChange={(e) =>
                    setFormPlacement({
                      ...formPlacement,
                      jobRole: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label>
                <p>Job Type:</p>
                <select
                  value={formPlacement.jobType}
                  onChange={(e) =>
                    setFormPlacement({
                      ...formPlacement,
                      jobType: e.target.value,
                    })
                  }
                  required
                >
                  <option value="" disabled>
                    Not Selected
                  </option>
                  <option value="on-site">On-Site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="wfh">Work from home</option>
                </select>
              </label>
              <label>
                <p>Location:</p>
                <input
                  type="text"
                  value={formPlacement.location}
                  onChange={(e) =>
                    setFormPlacement({
                      ...formPlacement,
                      location: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label>
                <p>Apply Link:</p>
                <input
                  type="text"
                  value={formPlacement.applyLink}
                  onChange={(e) =>
                    setFormPlacement({
                      ...formPlacement,
                      applyLink: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label>
                <p>Company Image URL:</p>
                <input
                  type="text"
                  value={formPlacement.companyImageUrl}
                  onChange={(e) =>
                    setFormPlacement({
                      ...formPlacement,
                      companyImageUrl: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                <p>Job Description:</p>
                <textarea
                  value={formPlacement.jobDescription}
                  onChange={(e) =>
                    setFormPlacement({
                      ...formPlacement,
                      jobDescription: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <div className="form-actions">
                <button type="submit">
                  {editingPlacement ? "Update" : "Add"}
                </button>
                <button type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDescriptionDialog && (
        <div className="description-dialog">
          <div className="description-dialog-content">
            <h3>Job Description</h3>
            <div className="description-content">
              {selectedDescription.split('\n').map((line, index) => (
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

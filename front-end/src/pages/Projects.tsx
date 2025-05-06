import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "./style/Projects.css";
import { mainUrlPrefix } from "../main";

interface Project {
  _id: string;
  userId: string;
  userName: string;
  projectTitle: string;
  projectDescription: string;
  gitLink: string;
  upiQR?: {
    data: string;
    contentType: string;
  };
}

export default function Projects() {
  const [tab, setTab] = useState<"Explore" | "Yours">("Explore");
  const userId = sessionStorage.getItem("user")?.trim();
  const userName = sessionStorage.getItem("userName")!;
  const role = sessionStorage.getItem("role")?.trim();
  const [projects, setProjects] = useState<Project[]>([]);
  const [fundRaiser, setFundRaiser] = useState(false);
  const [addProjectForm, setAddProjectForm] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    userName: userName,
    projectTitle: "",
    projectDescription: "",
    gitLink: "",
    upiQR: null,
  });

  // Fetch projects from backend
  const fetchProjects = useCallback(async () => {
    try {
      const endpoint =
        tab != "Explore"
          ? `${mainUrlPrefix}/project/getUserProject/${userId}`
          : `${mainUrlPrefix}/project/getAllProjects`;
      const response = await axios.get<{ projects: Project[] }>(endpoint);
      setProjects(response.data.projects || []);
      console.log(response.data.projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
    }
  }, [userId, tab]);

  useEffect(() => {
    if ((role === "user" && userId) || role !== "user") {
      fetchProjects();
    }
  }, [userId, role, fetchProjects]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file uploads
  const handleFileChange =
    (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    };

  // Add a new project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("projectTitle", formData.projectTitle);
      formDataToSend.append("projectDescription", formData.projectDescription);
      formDataToSend.append("gitLink", formData.gitLink);
      formDataToSend.append("userName", formData.userName);
      if (formData.upiQR) {
        formDataToSend.append("upiQR", formData.upiQR);
      }
      await axios.post(
        `${mainUrlPrefix}/project/addProject/${userId}`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log(
        "FormData to send:",
        Object.fromEntries(formDataToSend.entries())
      );
    } catch (error) {
      console.error("Failed to add project:", error);
    } finally {
      setAddProjectForm(false);
      setFundRaiser(false); // Reset fundraiser state
      setFormData({
        userName: userName,
        projectTitle: "",
        projectDescription: "",
        gitLink: "",
        upiQR: null,
      });
      fetchProjects();
    }
  };

  // Edit a project
  const handleEditProject = (project: Project) => {
    setEditProjectForm(project);
    setFormData({
      userName: project.userName,
      projectTitle: project.projectTitle,
      projectDescription: project.projectDescription,
      gitLink: project.gitLink,
      upiQR: project.upiQR as any,
    });
  };

  // Update a project
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("projectTitle", formData.projectTitle);
      formDataToSend.append("projectDescription", formData.projectDescription);
      formDataToSend.append("gitLink", formData.gitLink);
      formDataToSend.append("username", formData.userName);
      if (formData.upiQR) {
        formDataToSend.append("upiQR", formData.upiQR);
      }
      await axios.patch(
        `${mainUrlPrefix}/project/editProject/${editProjectForm?._id}`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } catch (error) {
      console.error("Failed to update project:", error);
    }finally {
      setAddProjectForm(false);
      setFundRaiser(false);
      setFormData({
        userName: userName,
        projectTitle: "",
        projectDescription: "",
        gitLink: "",
        upiQR: null,
      });
      fetchProjects();
    }
  };

  // Delete a project
  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await axios.delete(
        `${mainUrlPrefix}/project/deleteProject/${projectId}`
      );
      if (response.data.status === "success") {
        fetchProjects();
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <>
      <div className="projects-container">
        <div className="tabs">
          <button
            className={`tab ${tab === "Explore" ? "active" : ""}`}
            onClick={() => setTab("Explore")}
          >
            Explore
          </button>
          {role === "user" && (
            <button
              className={`tab ${tab === "Yours" ? "active" : ""}`}
              onClick={() => setTab("Yours")}
            >
              Yours
            </button>
          )}
        </div>
        <div>
          {tab === "Yours" && role === "user" && (
            <button
              className="add-project-btn"
              onClick={() => setAddProjectForm(true)}
            >
              Add Project
            </button>
          )}
        </div>
        <div className="projects-grid">
          {(tab === "Explore"
            ? projects
            : projects.filter((project) => project.userId === userId)
          ).map((project) => (
            <div key={project._id} className="project-card">
              {project.upiQR && (
                <div
                  className="fundRaiserTag"
                  title="This is a fundraiser project"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                  >
                    <path d="M531-260h96v-3L462-438l1-3h10q54 0 89.5-33t43.5-77h40v-47h-41q-3-15-10.5-28.5T576-653h70v-47H314v57h156q26 0 42.5 13t22.5 32H314v47h222q-6 20-23 34.5T467-502H367v64l164 178ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                </div>
              )}
              {project.upiQR && (
                <img
                  src={`${mainUrlPrefix}/project/projectImage/${project._id}`}
                  alt="UPI QR Code"
                  className="project-image"
                />
              )}
              <div>
                <h3>{project.projectTitle}</h3>
                <p>{project.projectDescription}</p>
              </div>
              <a
                href={project.gitLink}
                target="_blank"
                rel="noopener noreferrer"
                className="know-more-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 50 50"
                  fill="#fff"
                  height="24px"
                  width="24px"
                >
                  <path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39 c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2 c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975 c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714 c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999 c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6 c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5 c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999 c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689 c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33 c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25 C2,35.164,8.63,43.804,17.791,46.836z"></path>
                </svg>
                <p>View on GitHub</p>
              </a>
              {role === "user" && project.userId === userId && (
                <div className="post-actions">
                  <button
                    type="button"
                    onClick={() => handleEditProject(project)}
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
                    onClick={() => handleDeleteProject(project._id)}
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
          ))}
        </div>
        {addProjectForm && (
          <div className="dialog-overlay">
            <div className="modal-content">
              <h2>Add New Project</h2>
              <form onSubmit={handleAddProject}>
                <input
                  type="text"
                  name="projectTitle"
                  placeholder="Project Title"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  required
                />
                <textarea
                  name="projectDescription"
                  placeholder="Project Description"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
                <input
                  type="url"
                  name="gitLink"
                  placeholder="GitHub Link"
                  value={formData.gitLink}
                  onChange={handleInputChange}
                  required
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={fundRaiser}
                    onChange={(e) => setFundRaiser(e.target.checked)}
                  />
                  Include Fundraiser
                </label>
                {fundRaiser && (
                  <div className="file-input">
                    <label>UPI QR Code:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange("upiQR")}
                    />
                  </div>
                )}
                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    Add Project
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setAddProjectForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {editProjectForm && (
          <div className="dialog-overlay">
            <div className="modal-content">
              <h2>Edit Project</h2>
              <form onSubmit={handleUpdateProject}>
                <input
                  type="text"
                  name="projectTitle"
                  placeholder="Project Title"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  required
                />
                <textarea
                  name="projectDescription"
                  placeholder="Project Description"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
                <input
                  type="url"
                  name="gitLink"
                  placeholder="GitHub Link"
                  value={formData.gitLink}
                  onChange={handleInputChange}
                  required
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={fundRaiser}
                    onChange={(e) => setFundRaiser(e.target.checked)}
                  />
                  Include Fundraiser
                </label>
                {fundRaiser && (
                  <div className="file-input">
                    <label>UPI QR Code:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange("upiQR")}
                    />
                  </div>
                )}
                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    Update Project
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditProjectForm(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const Project = require("../model/projectModel");
const multer = require('multer');

// Configure Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const handleFileUpload = upload.fields([{ name: 'upiQR', maxCount: 1 }]);

const addProject = async (req, res) => {
  try {
    const { projectTitle, projectDescription, gitLink } = req.body;
    const userId = req.params.userId;

    // Handle file upload
    let upiQR = null;
    if (req.files && req.files.upiQR) {
      const upiQRFile = req.files.upiQR[0];
      upiQR = {
        data: upiQRFile.buffer,
        contentType: upiQRFile.mimetype
      };
    }

    const newProject = new Project({
      userId,
      username,
      projectTitle,
      projectDescription,
      gitLink,
      upiQR
    }); 

    await newProject.save();
    res.status(201).json({
      status: "success",
      message: "Project added successfully",
      project: newProject
    });

  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "Project cannot be added.",
      error: error.message
    });
  }
};

// Rest of the controller functions remain the same as in your original code
const getAllProject = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json({
      status: "Success",
      message: "fetched the project successfully.",
      projects: projects,
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `cannot fetch the project ${error}`,
    });
  }
};

const getUserProject = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        status: "failure",
        message: "User Id is required to fetch projects.",
      });
    }

    const projects = await Project.find({ userId });

    if (projects.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "No projects found for the given user ID.",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Projects fetched successfully.",
      projects,
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `cannot fetch the project of particular user ${error}.`,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.projectId);
    res.status(200).json({
      status: "success",
      message: "project deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `project cannot be deleted ${error}`,
    });
  }
};

const editProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updatedProject = {
      projectTitle: req.body.projectTitle,
      projectDescription: req.body.projectDescription,
      gitLink: req.body.gitLink,
      upiQR: req.body.upiQR 
    };
    const result = await Project.findByIdAndUpdate(projectId, updatedProject, {
      new: true,
    });
    if (!result) {
      return res.status(404).json({
        status: "failure",
        message: "project not found.",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "project details editted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "project details cannot be editted.",
    });
  }
};

const getProjectImage = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || !project.upiQR || !project.upiQR.data) {
      return res.status(404).json({ message: "Project image not found" });
    }

    res.set('Content-Type', project.upiQR.contentType);
    res.send(project.upiQR.data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  handleFileUpload,
  addProject,
  getAllProject,
  editProject,
  deleteProject,
  getUserProject,
  getProjectImage
};
const express = require('express');
const {handleFileUpload,addProject, editProject, deleteProject, getAllProject, getUserProject, getProjectImage} = require('../controller/projectController');
const router = express.Router();

router.post('/addProject/:userId', handleFileUpload, addProject);
router.get('/getAllProjects', getAllProject);
// http://localhost:8000/project/deleteProject/ project id
router.delete('/deleteProject/:projectId', deleteProject);
// http://localhost:8000/project/editProject/ project id
router.patch('/editProject/:projectId', editProject);
// http://localhost:8000/project/getUserProject/ user id
router.get('/getUserProject/:userId', getUserProject);
// GET project image by project ID 
router.get('/projectImage/:projectId', getProjectImage);

module.exports = router;
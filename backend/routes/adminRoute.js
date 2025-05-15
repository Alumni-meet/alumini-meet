const express = require('express');
const {getAllUsers, deleteUser} = require('../controller/adminController');
const router = express.Router();

// http://localhost:8000/admin/getAllUsers
router.get("/getAllUsers", getAllUsers);
// http://localhost:8000/admin/deleteUser/${id}
router.delete("/deleteUser/:id", deleteUser);

module.exports = router;

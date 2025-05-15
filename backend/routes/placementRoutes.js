const express = require("express");
const router = express.Router();
const placementController = require("../controller/placementController");

// Define routes
router.post("/addPlacement", placementController.addPlacement);
router.delete("/deletePlacement/:id", placementController.deletePlacement);
router.get("/getAllPlacement", placementController.getAllPlacement);
router.put("/editPlacement/:id", placementController.editPlacement);

module.exports = router;
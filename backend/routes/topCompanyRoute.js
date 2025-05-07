const express = require("express");
const router = express.Router();
const companyController = require("../controller/topCompaniesController");

router.get("/", companyController.getCompany);
router.post("/", companyController.addCompany);
router.put("/:id", companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);

router.post("/:companyId/alumni", companyController.addRemarks);
router.put("/:companyId/alumni/:userName", companyController.updateRemarks);
router.delete("/:companyId/alumni/:userName", companyController.deleteRemarks);
router.delete(
  "/:companyId/admin-delete/:alumniId",
  companyController.deleteRemarksAdmin
);

module.exports = router;

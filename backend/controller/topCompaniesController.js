const Company = require("../model/topCompanyModel");

exports.getCompany = async (req, res) => {
  try {
    const response = await Company.find();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addCompany = async (req, res) => {
  try {
    const newCompany = await Company.create(req.body);
    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCompany)
      return res.status(404).json({ message: "Company not found" });
    res.json(updatedCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);
    if (!deletedCompany)
      return res.status(404).json({ message: "Company not found" });
    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addRemarks = async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.alumni.push({
      userName: req.body.userName,
      remarks: req.body.remarks,
    });

    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRemarks = async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const alumniIndex = company.alumni.findIndex(
      (a) => a.userName === req.params.userName,
    );

    if (alumniIndex === -1)
      return res.status(404).json({ message: "Remarks not found" });

    company.alumni[alumniIndex].remarks = req.body.remarks;
    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRemarks = async (req, res) => {
  try {
    const { companyId, userName } = req.params;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const initialAlumni = company.alumni;
    company.alumni = company.alumni.filter((alum) => alum.userName !== userName);

    if (initialAlumni.length === company.alumni.length) {
      return res.status(404).json({ message: "Remark not found" });
    }

    await company.save();

    res.json({ message: "Remark deleted successfully" });
  } catch (error) {
    console.error("Error deleting remark:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRemarksAdmin = async (req, res) => {
  try {
    const { companyId, alumniId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ 
        status: "error",
        message: "Company not found" 
      });
    }

    const initialLength = company.alumni.length;
    company.alumni = company.alumni.filter(a => a._id.toString() !== alumniId);

    if (initialLength === company.alumni.length) {
      return res.status(404).json({ 
        status: "error",
        message: "Alumni remark not found" 
      });
    }

    await company.save();
    
    res.status(200).json({ 
      status: "success",
      message: "Remark deleted successfully",
      data: company
    });
  } catch (error) {
    console.error("Error deleting remark:", error);
    res.status(500).json({ 
      status: "error",
      message: error.message || "Internal server error"
    });
  }
};

const Referral = require("../model/referralModel");

const addReferral = async (req, res) => {
  try {
    const referral = await Referral.create({
        referraltitle: req.body.referraltitle,
        jobDescription: req.body.jobDescription,
        applyLink: req.body.applyLink,
        userId: req.params.id,
        userName: req.body.userName,
    });

    const referralDetail = {
      referraltitle: referral.referraltitle,
      jobDescription: referral.jobDescription,
      applyLink: referral.applyLink,
      userId: referral.userId,
      userName: referral.userName,
    };

    res.status(200).json({
      status: "Success",
      message: "project added successfully.",
      event: referralDetail,
    });
  } catch (error) {
    res.status(400).json({
      status: "failure",
      message: "project cannot be added.",
    });
  }
};

const getAllReferral = async (req, res) => {
  try {
    const referrals = await Referral.find();
    res.status(200).json({
      status: "Success",
      message: "fetched the referrals successfully.",
      referral: referrals
    });
  } catch (error) {
    res.status(200).json({
      status: "failure",
      message: `cannot fetch the referrals ${error}`,
    });
  }
};

const getUserReferrals = async (req, res) =>{
    try{
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                status: "failure",
                message: "User Id is required to fetch referrals.",
            });
        }

        const referrals = await Referral.find({ userId });

        return res.status(200).json({
            status: "Success",
            message: "Referrals fetched successfully.",
            referrals: referrals,
        });

    }catch(error){
        res.status(500).json({
            status: "failure",
            message: `cannot fetch the referrals of particular user ${error}.`,
          });
    }
}

const deleteReferral = async (req, res) => {
  try {
    await Referral.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "Success",
      message: "referral deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `referral cannot be deleted ${error}`,
    });
  }
};

const editReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReferral = {
      referraltitle: req.body.referraltitle,
      jobDescription: req.body.jobDescription,
      applyLink: req.body.applyLink,
    };
    const result = await Referral.findByIdAndUpdate(id, updatedReferral, {
      new: true,
    });
    if (!result) {
      return res.status(404).json({
        status: "failure",
        message: "referral not found.",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "referral details editted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "referral details cannot be editted.",
    });
  }
};

module.exports = { addReferral, editReferral, deleteReferral, getUserReferrals, getAllReferral };

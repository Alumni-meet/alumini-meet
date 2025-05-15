const express = require('express');
const {addReferral, getAllReferral, getUserReferrals, deleteReferral, editReferral} = require('../controller/referralController');
const router = express.Router();

// http://localhost:8000/referral/getAllReferrals
router.get('/getAllReferrals', getAllReferral);
// http://localhost:8000/referral/addReferral/user id
router.post('/addReferral/:id', addReferral);
// http://localhost:8000/referral/deleteReferral/ referral id
router.delete('/deleteReferral/:id', deleteReferral);
// http://localhost:8000/referral/editReferral/ referral id
router.patch('/editReferral/:id', editReferral);
// http://localhost:8000/referral/getUserReferrals/ user id
router.get('/getUserReferrals/:userId', getUserReferrals);

module.exports = router;
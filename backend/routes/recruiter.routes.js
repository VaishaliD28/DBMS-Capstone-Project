const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/profile', authenticate, authorize('recruiter'), recruiterController.getProfile);
router.put('/profile', authenticate, authorize('recruiter'), recruiterController.updateRecruiterProfile);
router.put('/company', authenticate, authorize('recruiter'), recruiterController.updateCompanyProfile);

module.exports = router;

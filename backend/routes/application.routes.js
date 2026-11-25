const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');

// Student endpoints
router.post('/apply', authenticate, authorize('student'), applicationController.apply);
router.get('/my-applications', authenticate, authorize('student'), applicationController.getMyApplications);

// Shared / Detail endpoint
router.get('/:id', authenticate, applicationController.getApplicationById);

// Recruiter endpoints
router.get('/opportunity/:opportunityId', authenticate, authorize('recruiter', 'admin'), applicationController.getOpportunityApplicants);
router.put('/:id/status', authenticate, authorize('recruiter', 'admin'), applicationController.updateApplicationStatus);

module.exports = router;

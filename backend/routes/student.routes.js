const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

// Student profile & skills (student role protected)
router.get('/profile', authenticate, authorize('student'), studentController.getProfile);
router.put('/profile', authenticate, authorize('student'), studentController.updateProfile);
router.post('/resume', authenticate, authorize('student'), uploadResume.single('resume'), studentController.uploadResume);

router.get('/skills', authenticate, authorize('student'), studentController.getSkills);
router.post('/skills', authenticate, authorize('student'), studentController.addOrUpdateSkill);
router.delete('/skills/:skillId', authenticate, authorize('student'), studentController.removeSkill);

// Dynamic Eligibility & Skill Match Check for an opportunity
router.get('/eligibility/:opportunityId', authenticate, authorize('student'), studentController.checkEligibilityAndMatch);

module.exports = router;

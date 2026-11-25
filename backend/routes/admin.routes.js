const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes protected with admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/placement-analytics', adminController.getPlacementAnalytics);
router.get('/pending-opportunities', adminController.getPendingOpportunities);
router.put('/opportunities/:id/approval', adminController.updateOpportunityApproval);

router.get('/students', adminController.getAllStudents);
router.put('/students/:userId/status', adminController.updateStudentStatus);

router.get('/recruiters', adminController.getAllRecruiters);
router.put('/recruiters/:userId/status', adminController.updateRecruiterStatus);

router.get('/applications', adminController.getAllApplications);
router.get('/analytics-showcase/:queryKey', adminController.executeShowcaseQuery);

module.exports = router;

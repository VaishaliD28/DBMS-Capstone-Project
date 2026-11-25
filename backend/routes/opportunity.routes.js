const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { authenticate, authorize } = require('../middleware/auth');

// Optional auth middleware for list view to calculate matching score if logged in
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
}

// Public / Candidate endpoints
router.get('/', optionalAuth, opportunityController.getOpportunities);
router.get('/recruiter/my-postings', authenticate, authorize('recruiter'), opportunityController.getRecruiterOpportunities);
router.get('/:id', optionalAuth, opportunityController.getOpportunityById);

// Recruiter post / edit / delete
router.post('/', authenticate, authorize('recruiter'), opportunityController.createOpportunity);
router.put('/:id', authenticate, authorize('recruiter', 'admin'), opportunityController.updateOpportunity);
router.delete('/:id', authenticate, authorize('recruiter', 'admin'), opportunityController.deleteOpportunity);

module.exports = router;

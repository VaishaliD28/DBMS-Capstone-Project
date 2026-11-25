const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', skillController.getAllSkills);
router.post('/', authenticate, authorize('admin'), skillController.createSkill);

module.exports = router;

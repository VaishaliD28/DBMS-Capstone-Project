const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register/student', authController.registerStudent);
router.post('/register/recruiter', authController.registerRecruiter);
router.get('/me', authenticate, authController.getMe);

module.exports = router;

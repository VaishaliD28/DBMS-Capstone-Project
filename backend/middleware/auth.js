const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_placement_portal_jwt_key_2026_capstone';

// Authenticate JWT Token
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user details from database
    const users = await db.query('SELECT id, email, role, status FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    const user = users[0];
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account is suspended. Contact Placement Administrator.' });
    }

    // Attach role-specific IDs
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };

    if (user.role === 'student') {
      const students = await db.query('SELECT id, full_name, roll_number, department, cgpa, graduation_year, resume_url FROM students WHERE user_id = ?', [user.id]);
      if (students && students.length > 0) {
        req.user.student = students[0];
        req.user.student_id = students[0].id;
      }
    } else if (user.role === 'recruiter') {
      const recruiters = await db.query('SELECT r.id, r.company_id, r.full_name, r.designation, c.name AS company_name FROM recruiters r LEFT JOIN companies c ON r.company_id = c.id WHERE r.user_id = ?', [user.id]);
      if (recruiters && recruiters.length > 0) {
        req.user.recruiter = recruiters[0];
        req.user.recruiter_id = recruiters[0].id;
        req.user.company_id = recruiters[0].company_id;
      }
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
}

// Authorize specific roles
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] roles. Your role is ${req.user.role}.`
      });
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorize,
  JWT_SECRET
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// 1. LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const users = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const user = users[0];

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    // Role-specific payload details
    let profileData = null;
    if (user.role === 'student') {
      const students = await db.query('SELECT * FROM students WHERE user_id = ?', [user.id]);
      if (students.length > 0) profileData = students[0];
    } else if (user.role === 'recruiter') {
      const recruiters = await db.query(
        'SELECT r.*, c.name AS company_name, c.logo_url AS company_logo FROM recruiters r LEFT JOIN companies c ON r.company_id = c.id WHERE r.user_id = ?',
        [user.id]
      );
      if (recruiters.length > 0) profileData = recruiters[0];
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${profileData ? profileData.full_name : 'Admin'}!`,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: profileData
      }
    });
  } catch (err) {
    console.error('[Login Controller Error]:', err);
    return res.status(500).json({ success: false, message: 'An internal server error occurred during login.' });
  }
}

// 2. REGISTER STUDENT
async function registerStudent(req, res) {
  try {
    const {
      email,
      password,
      fullName,
      rollNumber,
      phone,
      department,
      cgpa,
      graduationYear,
      bio,
      skillIds = []
    } = req.body;

    // Validation
    if (!email || !password || !fullName || !rollNumber || !department || !cgpa || !graduationYear) {
      return res.status(400).json({ success: false, message: 'All required student fields must be filled.' });
    }

    const numericCgpa = parseFloat(cgpa);
    if (isNaN(numericCgpa) || numericCgpa < 0 || numericCgpa > 10) {
      return res.status(400).json({ success: false, message: 'CGPA must be a valid number between 0.00 and 10.00' });
    }

    // Check duplicate email
    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
      [email.trim().toLowerCase(), passwordHash, 'student', 'active']
    );
    const userId = userResult.insertId;

    // Insert student
    const defaultResume = '/uploads/sample-resume.pdf';
    const studentResult = await db.query(
      'INSERT INTO students (user_id, full_name, roll_number, phone, department, cgpa, graduation_year, bio, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, fullName.trim(), rollNumber.trim().toUpperCase(), phone || '', department, numericCgpa, parseInt(graduationYear, 10), bio || '', defaultResume]
    );
    const studentId = studentResult.insertId;

    // Insert Skills if provided
    if (Array.isArray(skillIds) && skillIds.length > 0) {
      for (const skillId of skillIds) {
        try {
          await db.query(
            'INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES (?, ?, ?)',
            [studentId, parseInt(skillId, 10), 'Intermediate']
          );
        } catch (e) {
          // Ignore duplicate skill insertion
        }
      }
    }

    const newUser = { id: userId, email: email.trim().toLowerCase(), role: 'student', status: 'active' };
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully!',
      token,
      user: {
        id: userId,
        email: newUser.email,
        role: newUser.role,
        profile: {
          id: studentId,
          user_id: userId,
          full_name: fullName,
          roll_number: rollNumber,
          department,
          cgpa: numericCgpa,
          graduation_year: parseInt(graduationYear, 10)
        }
      }
    });
  } catch (err) {
    console.error('[Register Student Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to register student account.' });
  }
}

// 3. REGISTER RECRUITER
async function registerRecruiter(req, res) {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      designation,
      companyId,
      newCompanyName,
      companyWebsite,
      companyIndustry,
      companyLocation
    } = req.body;

    if (!email || !password || !fullName || !designation) {
      return res.status(400).json({ success: false, message: 'All required recruiter fields must be filled.' });
    }

    // Check duplicate user
    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    let targetCompanyId = companyId ? parseInt(companyId, 10) : null;

    // If new company specified
    if (!targetCompanyId && newCompanyName) {
      const compResult = await db.query(
        'INSERT INTO companies (name, website, industry, description, location, logo_url, contact_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          newCompanyName.trim(),
          companyWebsite || 'https://example.com',
          companyIndustry || 'Information Technology',
          'Registered partner organization.',
          companyLocation || 'India',
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
          email.trim().toLowerCase()
        ]
      );
      targetCompanyId = compResult.insertId;
    }

    if (!targetCompanyId) {
      return res.status(400).json({ success: false, message: 'Please select or provide a company.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
      [email.trim().toLowerCase(), passwordHash, 'recruiter', 'active']
    );
    const userId = userResult.insertId;

    // Insert recruiter
    const recResult = await db.query(
      'INSERT INTO recruiters (user_id, company_id, full_name, phone, designation) VALUES (?, ?, ?, ?, ?)',
      [userId, targetCompanyId, fullName.trim(), phone || '', designation.trim()]
    );
    const recruiterId = recResult.insertId;

    const newUser = { id: userId, email: email.trim().toLowerCase(), role: 'recruiter', status: 'active' };
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Recruiter account registered successfully!',
      token,
      user: {
        id: userId,
        email: newUser.email,
        role: newUser.role,
        profile: {
          id: recruiterId,
          company_id: targetCompanyId,
          full_name: fullName,
          designation
        }
      }
    });
  } catch (err) {
    console.error('[Register Recruiter Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to register recruiter account.' });
  }
}

// 4. GET CURRENT AUTHENTICATED USER
async function getMe(req, res) {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        profile: req.user.student || req.user.recruiter || null
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving profile session.' });
  }
}

module.exports = {
  login,
  registerStudent,
  registerRecruiter,
  getMe
};

const db = require('../config/db');

// 1. GET STUDENT PROFILE
async function getProfile(req, res) {
  try {
    const studentId = req.user.student_id;
    if (!studentId) {
      return res.status(404).json({ success: false, message: 'Student profile not associated with this account.' });
    }

    const students = await db.query(
      `SELECT s.*, u.email, u.status AS account_status 
       FROM students s 
       INNER JOIN users u ON s.user_id = u.id 
       WHERE s.id = ?`,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const student = students[0];

    // Fetch skills
    const skills = await db.query(
      `SELECT ss.id AS mapping_id, ss.skill_id, sk.name, sk.category, ss.proficiency 
       FROM student_skills ss 
       INNER JOIN skills sk ON ss.skill_id = sk.id 
       WHERE ss.student_id = ? 
       ORDER BY sk.category, sk.name`,
      [studentId]
    );

    // Fetch application summary stats
    const appStats = await db.query(
      `SELECT 
         COUNT(*) AS total_applied,
         COUNT(CASE WHEN status = 'Shortlisted' THEN 1 END) AS shortlisted_count,
         COUNT(CASE WHEN status = 'Interview' THEN 1 END) AS interview_count,
         COUNT(CASE WHEN status = 'Selected' THEN 1 END) AS offers_count
       FROM applications 
       WHERE student_id = ?`,
      [studentId]
    );

    return res.status(200).json({
      success: true,
      profile: {
        ...student,
        skills,
        stats: appStats[0] || { total_applied: 0, shortlisted_count: 0, interview_count: 0, offers_count: 0 }
      }
    });
  } catch (err) {
    console.error('[Get Profile Error]:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving profile data.' });
  }
}

// 2. UPDATE STUDENT PROFILE
async function updateProfile(req, res) {
  try {
    const studentId = req.user.student_id;
    const { fullName, phone, department, cgpa, graduationYear, bio } = req.body;

    const numericCgpa = parseFloat(cgpa);
    if (isNaN(numericCgpa) || numericCgpa < 0 || numericCgpa > 10) {
      return res.status(400).json({ success: false, message: 'CGPA must be a valid number between 0.00 and 10.00' });
    }

    await db.query(
      `UPDATE students 
       SET full_name = ?, phone = ?, department = ?, cgpa = ?, graduation_year = ?, bio = ?, updated_at = NOW() 
       WHERE id = ?`,
      [fullName.trim(), phone || '', department, numericCgpa, parseInt(graduationYear, 10), bio || '', studentId]
    );

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully!'
    });
  } catch (err) {
    console.error('[Update Profile Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update student profile.' });
  }
}

// 3. UPLOAD RESUME (PDF)
async function uploadResume(req, res) {
  try {
    const studentId = req.user.student_id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;

    await db.query(
      'UPDATE students SET resume_url = ?, updated_at = NOW() WHERE id = ?',
      [resumeUrl, studentId]
    );

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully!',
      resumeUrl
    });
  } catch (err) {
    console.error('[Upload Resume Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload resume file.' });
  }
}

// 4. GET STUDENT SKILLS
async function getSkills(req, res) {
  try {
    const studentId = req.user.student_id;
    const skills = await db.query(
      `SELECT ss.id, ss.skill_id, sk.name, sk.category, ss.proficiency 
       FROM student_skills ss 
       INNER JOIN skills sk ON ss.skill_id = sk.id 
       WHERE ss.student_id = ?`,
      [studentId]
    );
    return res.status(200).json({ success: true, skills });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching skills.' });
  }
}

// 5. ADD OR UPDATE SKILL
async function addOrUpdateSkill(req, res) {
  try {
    const studentId = req.user.student_id;
    const { skillId, proficiency = 'Intermediate' } = req.body;

    if (!skillId) {
      return res.status(400).json({ success: false, message: 'Skill selection is required.' });
    }

    // Check if skill already exists
    const existing = await db.query(
      'SELECT id FROM student_skills WHERE student_id = ? AND skill_id = ?',
      [studentId, skillId]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE student_skills SET proficiency = ? WHERE student_id = ? AND skill_id = ?',
        [proficiency, studentId, skillId]
      );
    } else {
      await db.query(
        'INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES (?, ?, ?)',
        [studentId, skillId, proficiency]
      );
    }

    return res.status(200).json({ success: true, message: 'Skill saved successfully!' });
  } catch (err) {
    console.error('[Add Skill Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to save skill.' });
  }
}

// 6. REMOVE SKILL
async function removeSkill(req, res) {
  try {
    const studentId = req.user.student_id;
    const { skillId } = req.params;

    await db.query(
      'DELETE FROM student_skills WHERE student_id = ? AND skill_id = ?',
      [studentId, skillId]
    );

    return res.status(200).json({ success: true, message: 'Skill removed successfully!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to remove skill.' });
  }
}

// 7. DYNAMIC ELIGIBILITY CHECKER & SMART SKILL MATCH
async function checkEligibilityAndMatch(req, res) {
  try {
    const studentId = req.user.student_id;
    const { opportunityId } = req.params;

    // Student profile
    const students = await db.query('SELECT * FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    const student = students[0];

    // Opportunity details
    const opportunities = await db.query('SELECT * FROM opportunities WHERE id = ?', [opportunityId]);
    if (opportunities.length === 0) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }
    const opp = opportunities[0];

    // Eligibility check logic
    const cgpaEligible = student.cgpa >= parseFloat(opp.min_cgpa);
    const gradYearEligible = !opp.allowed_graduation_year || student.graduation_year === opp.allowed_graduation_year;
    const isDeadlinePassed = new Date(opp.deadline) < new Date(new Date().setHours(0,0,0,0));
    const isApproved = opp.status === 'approved';

    const isEligible = cgpaEligible && gradYearEligible && !isDeadlinePassed && isApproved;

    // Duplicate check
    const existingApps = await db.query(
      'SELECT id, status, applied_at FROM applications WHERE student_id = ? AND opportunity_id = ?',
      [studentId, opportunityId]
    );
    const hasAlreadyApplied = existingApps.length > 0;

    // Skill Match breakdown
    const oppSkills = await db.query(
      `SELECT os.skill_id, sk.name, sk.category, os.is_required 
       FROM opportunity_skills os 
       INNER JOIN skills sk ON os.skill_id = sk.id 
       WHERE os.opportunity_id = ?`,
      [opportunityId]
    );

    const studentSkills = await db.query(
      'SELECT skill_id, proficiency FROM student_skills WHERE student_id = ?',
      [studentId]
    );
    const studentSkillMap = new Map(studentSkills.map(s => [s.skill_id, s.proficiency]));

    let matchedSkills = [];
    let missingSkills = [];
    let requiredCount = 0;
    let matchedCount = 0;

    oppSkills.forEach(os => {
      requiredCount++;
      if (studentSkillMap.has(os.skill_id)) {
        matchedCount++;
        matchedSkills.push({
          id: os.skill_id,
          name: os.name,
          category: os.category,
          proficiency: studentSkillMap.get(os.skill_id)
        });
      } else {
        missingSkills.push({
          id: os.skill_id,
          name: os.name,
          category: os.category,
          isRequired: Boolean(os.is_required)
        });
      }
    });

    const matchPercentage = requiredCount === 0 ? 100 : Math.min(100, Math.round((matchedCount / requiredCount) * 100));

    return res.status(200).json({
      success: true,
      eligibility: {
        isEligible,
        cgpaEligible,
        studentCgpa: student.cgpa,
        requiredCgpa: opp.min_cgpa,
        gradYearEligible,
        studentGradYear: student.graduation_year,
        requiredGradYear: opp.allowed_graduation_year,
        isDeadlinePassed,
        deadline: opp.deadline,
        isApproved,
        hasAlreadyApplied,
        applicationDetails: hasAlreadyApplied ? existingApps[0] : null
      },
      skillsAnalysis: {
        matchPercentage,
        matchedCount,
        totalRequired: requiredCount,
        matchedSkills,
        missingSkills
      }
    });
  } catch (err) {
    console.error('[Check Eligibility Error]:', err);
    return res.status(500).json({ success: false, message: 'Error checking eligibility.' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  getSkills,
  addOrUpdateSkill,
  removeSkill,
  checkEligibilityAndMatch
};

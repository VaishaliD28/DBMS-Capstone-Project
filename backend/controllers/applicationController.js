const db = require('../config/db');

// 1. APPLY FOR OPPORTUNITY
async function apply(req, res) {
  try {
    const studentId = req.user.student_id;
    const { opportunityId, coverLetter, resumeUrl } = req.body;

    if (!opportunityId) {
      return res.status(400).json({ success: false, message: 'Opportunity ID is required.' });
    }

    // Fetch Student Details
    const students = await db.query('SELECT * FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    const student = students[0];

    // Fetch Opportunity Details
    const opportunities = await db.query('SELECT * FROM opportunities WHERE id = ?', [opportunityId]);
    if (opportunities.length === 0) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }
    const opp = opportunities[0];

    // 1. Status Check
    if (opp.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot apply: Opportunity is not open or approved.' });
    }

    // 2. Deadline Check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(opp.deadline);
    if (deadlineDate < today) {
      return res.status(400).json({ success: false, message: 'Application deadline has already passed.' });
    }

    // 3. CGPA Eligibility Check
    if (student.cgpa < parseFloat(opp.min_cgpa)) {
      return res.status(403).json({
        success: false,
        message: `Eligibility criteria not met: Minimum CGPA required is ${opp.min_cgpa}, your CGPA is ${student.cgpa}.`
      });
    }

    // 4. Graduation Year Eligibility Check
    if (opp.allowed_graduation_year && student.graduation_year !== opp.allowed_graduation_year) {
      return res.status(403).json({
        success: false,
        message: `Eligibility criteria not met: Opportunity is for ${opp.allowed_graduation_year} passing batch.`
      });
    }

    // 5. Duplicate Application Check
    const existing = await db.query(
      'SELECT id FROM applications WHERE opportunity_id = ? AND student_id = ?',
      [opportunityId, studentId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already applied for this opportunity.' });
    }

    // 6. Calculate Smart Skill Match Score
    const reqSkills = await db.query(
      'SELECT skill_id FROM opportunity_skills WHERE opportunity_id = ?',
      [opportunityId]
    );

    const studSkills = await db.query(
      'SELECT skill_id FROM student_skills WHERE student_id = ?',
      [studentId]
    );

    const studSkillSet = new Set(studSkills.map(s => s.skill_id));
    let matchScore = 100;

    if (reqSkills.length > 0) {
      const matched = reqSkills.filter(s => studSkillSet.has(s.skill_id)).length;
      matchScore = Math.min(100, Math.round((matched / reqSkills.length) * 100));
    }

    const applicationResume = resumeUrl || student.resume_url || '/uploads/sample-resume.pdf';

    // Insert Application
    const insertResult = await db.query(
      `INSERT INTO applications (
        opportunity_id, student_id, status, cover_letter, resume_url, match_score
      ) VALUES (?, ?, 'Applied', ?, ?, ?)`,
      [opportunityId, studentId, coverLetter || '', applicationResume, matchScore]
    );

    const applicationId = insertResult.insertId;

    // Insert initial status history audit record
    await db.query(
      `INSERT INTO application_status_history (
        application_id, status, remarks, changed_by_user_id
      ) VALUES (?, 'Applied', 'Application submitted by candidate via placement portal.', ?)`,
      [applicationId, req.user.id]
    );

    // Insert Notification for Student
    await db.query(
      `INSERT INTO notifications (
        user_id, title, message, type, reference_id
      ) VALUES (?, ?, ?, 'application_status', ?)`,
      [
        req.user.id,
        `Applied: ${opp.title}`,
        `Your application for "${opp.title}" has been successfully recorded.`,
        applicationId
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      applicationId,
      matchScore
    });
  } catch (err) {
    console.error('[Apply Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit application.' });
  }
}

// 2. GET MY APPLICATIONS (Student)
async function getMyApplications(req, res) {
  try {
    const studentId = req.user.student_id;

    const applications = await db.query(
      `SELECT 
        a.id,
        a.opportunity_id,
        a.student_id,
        a.status,
        a.cover_letter,
        a.resume_url,
        a.match_score,
        a.applied_at,
        a.updated_at,
        o.title AS opportunity_title,
        o.type AS opportunity_type,
        o.salary_or_stipend,
        o.location AS opportunity_location,
        o.work_mode,
        o.deadline,
        c.id AS company_id,
        c.name AS company_name,
        c.logo_url AS company_logo
      FROM applications a
      INNER JOIN opportunities o ON a.opportunity_id = o.id
      INNER JOIN companies c ON o.company_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.applied_at DESC`,
      [studentId]
    );

    // Attach latest status remark to each application
    const enriched = await Promise.all(applications.map(async (app) => {
      const history = await db.query(
        `SELECT status, remarks, changed_at 
         FROM application_status_history 
         WHERE application_id = ? 
         ORDER BY changed_at DESC LIMIT 1`,
        [app.id]
      );

      return {
        ...app,
        latest_remark: history.length > 0 ? history[0].remarks : 'Application submitted.'
      };
    }));

    return res.status(200).json({
      success: true,
      applications: enriched
    });
  } catch (err) {
    console.error('[Get My Applications Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch application records.' });
  }
}

// 3. GET APPLICATION BY ID (With complete timeline history)
async function getApplicationById(req, res) {
  try {
    const { id } = req.params;

    const apps = await db.query(
      `SELECT 
        a.*,
        o.title AS opportunity_title,
        o.type AS opportunity_type,
        o.salary_or_stipend,
        o.location AS opportunity_location,
        o.work_mode,
        o.deadline,
        c.name AS company_name,
        c.logo_url AS company_logo,
        s.full_name AS student_name,
        s.roll_number,
        s.department,
        s.cgpa,
        s.graduation_year,
        s.phone AS student_phone,
        u.email AS student_email
      FROM applications a
      INNER JOIN opportunities o ON a.opportunity_id = o.id
      INNER JOIN companies c ON o.company_id = c.id
      INNER JOIN students s ON a.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE a.id = ?`,
      [id]
    );

    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const application = apps[0];

    // Authorization check
    if (req.user.role === 'student' && application.student_id !== req.user.student_id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only view your own applications.' });
    }

    // Fetch timeline history
    const history = await db.query(
      `SELECT 
        ash.*,
        u.email AS changed_by_email,
        u.role AS changed_by_role
       FROM application_status_history ash
       LEFT JOIN users u ON ash.changed_by_user_id = u.id
       WHERE ash.application_id = ?
       ORDER BY ash.changed_at ASC`,
      [id]
    );

    application.history = history;

    return res.status(200).json({
      success: true,
      application
    });
  } catch (err) {
    console.error('[Get Application By ID Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch application details.' });
  }
}

// 4. GET APPLICANTS FOR AN OPPORTUNITY (Recruiter)
async function getOpportunityApplicants(req, res) {
  try {
    const { opportunityId } = req.params;
    const { status, minMatch, sortBy = 'match' } = req.query;

    let sql = `
      SELECT 
        a.id AS application_id,
        a.status,
        a.cover_letter,
        a.resume_url,
        a.match_score,
        a.applied_at,
        a.updated_at,
        s.id AS student_id,
        s.full_name AS student_name,
        s.roll_number,
        s.department,
        s.cgpa,
        s.graduation_year,
        s.phone AS student_phone,
        u.email AS student_email
      FROM applications a
      INNER JOIN students s ON a.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE a.opportunity_id = ?
    `;

    const params = [opportunityId];

    if (status && status !== 'All') {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (minMatch) {
      sql += ' AND a.match_score >= ?';
      params.push(parseInt(minMatch, 10));
    }

    if (sortBy === 'cgpa') {
      sql += ' ORDER BY s.cgpa DESC';
    } else if (sortBy === 'date') {
      sql += ' ORDER BY a.applied_at DESC';
    } else {
      sql += ' ORDER BY a.match_score DESC, s.cgpa DESC';
    }

    const applicants = await db.query(sql, params);

    // Attach student skills summary to each applicant
    const enriched = await Promise.all(applicants.map(async (app) => {
      const skills = await db.query(
        `SELECT sk.name, ss.proficiency 
         FROM student_skills ss 
         INNER JOIN skills sk ON ss.skill_id = sk.id 
         WHERE ss.student_id = ? 
         LIMIT 6`,
        [app.student_id]
      );
      return { ...app, skills };
    }));

    return res.status(200).json({
      success: true,
      count: enriched.length,
      applicants: enriched
    });
  } catch (err) {
    console.error('[Get Applicants Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch applicants.' });
  }
}

// 5. UPDATE APPLICATION STATUS (Recruiter/Admin)
async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const apps = await db.query(
      `SELECT a.*, o.title AS opp_title, s.user_id AS student_user_id 
       FROM applications a 
       INNER JOIN opportunities o ON a.opportunity_id = o.id 
       INNER JOIN students s ON a.student_id = s.id 
       WHERE a.id = ?`,
      [id]
    );

    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const app = apps[0];

    // Update status in applications table
    await db.query(
      'UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Insert into audit history
    const historyRemark = remarks || `Application status changed to ${status}.`;
    await db.query(
      `INSERT INTO application_status_history (
        application_id, status, remarks, changed_by_user_id
      ) VALUES (?, ?, ?, ?)`,
      [id, status, historyRemark, req.user.id]
    );

    // Insert student notification
    let notifTitle = `Status Update: ${app.opp_title}`;
    let notifBody = `Your application for "${app.opp_title}" has been updated to: ${status}.`;
    if (status === 'Selected') {
      notifTitle = `🎉 Selected! Congratulations!`;
      notifBody = `Congratulations! You have been Selected for "${app.opp_title}". Check remarks: "${historyRemark}".`;
    } else if (status === 'Shortlisted') {
      notifTitle = `⭐ Shortlisted for ${app.opp_title}`;
    } else if (status === 'Interview') {
      notifTitle = `📅 Interview Invitation: ${app.opp_title}`;
    }

    await db.query(
      `INSERT INTO notifications (
        user_id, title, message, type, reference_id
      ) VALUES (?, ?, ?, 'application_status', ?)`,
      [app.student_user_id, notifTitle, notifBody, id]
    );

    return res.status(200).json({
      success: true,
      message: `Candidate status updated to "${status}" successfully!`
    });
  } catch (err) {
    console.error('[Update Application Status Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update application status.' });
  }
}

module.exports = {
  apply,
  getMyApplications,
  getApplicationById,
  getOpportunityApplicants,
  updateApplicationStatus
};

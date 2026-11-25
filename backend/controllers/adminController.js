const db = require('../config/db');

// 1. GET ADMIN DASHBOARD OVERVIEW METRICS
async function getDashboardStats(req, res) {
  try {
    const studentsCount = await db.query('SELECT COUNT(*) AS total FROM students');
    const companiesCount = await db.query('SELECT COUNT(*) AS total FROM companies');
    const activeOppCount = await db.query("SELECT COUNT(*) AS total FROM opportunities WHERE status = 'approved'");
    const pendingOppCount = await db.query("SELECT COUNT(*) AS total FROM opportunities WHERE status = 'pending_approval'");
    const applicationsCount = await db.query('SELECT COUNT(*) AS total FROM applications');
    const placedStudents = await db.query("SELECT COUNT(DISTINCT student_id) AS total FROM applications WHERE status = 'Selected'");
    const avgCgpaResult = await db.query('SELECT ROUND(AVG(cgpa), 2) AS avg_cgpa FROM students');

    const totalStudents = studentsCount[0].total || 0;
    const totalPlaced = placedStudents[0].total || 0;
    const placementRate = totalStudents > 0 ? ((totalPlaced / totalStudents) * 100).toFixed(1) : '0.0';

    return res.status(200).json({
      success: true,
      stats: {
        total_students: totalStudents,
        total_companies: companiesCount[0].total || 0,
        total_active_opportunities: activeOppCount[0].total || 0,
        total_pending_approvals: pendingOppCount[0].total || 0,
        total_applications: applicationsCount[0].total || 0,
        total_placed_students: totalPlaced,
        placement_rate: parseFloat(placementRate),
        campus_average_cgpa: avgCgpaResult[0].avg_cgpa || '8.5'
      }
    });
  } catch (err) {
    console.error('[Admin Dashboard Stats Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
  }
}

// 2. GET PLACEMENT ANALYTICS FOR CHARTS
async function getPlacementAnalytics(req, res) {
  try {
    // 1. Department-wise Placement Statistics (GROUP BY s.department)
    const departmentStats = await db.query(`
      SELECT 
        s.department,
        COUNT(DISTINCT s.id) AS total_students,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.id END) AS placed_students,
        ROUND(
          (COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.id END) * 100.0) / 
          NULLIF(COUNT(DISTINCT s.id), 0), 1
        ) AS placement_percentage,
        ROUND(AVG(s.cgpa), 2) AS average_cgpa
      FROM students s
      LEFT JOIN applications a ON s.id = a.student_id
      GROUP BY s.department
      ORDER BY placement_percentage DESC
    `);

    // 2. Application Status Distribution (GROUP BY status)
    const statusDistribution = await db.query(`
      SELECT 
        status,
        COUNT(*) AS count
      FROM applications
      GROUP BY status
      ORDER BY FIELD(status, 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected')
    `);

    // 3. Top Demanded Skills in Placement (JOIN skills, opportunity_skills, student_skills)
    const topSkills = await db.query(`
      SELECT 
        sk.name AS skill_name,
        sk.category,
        COUNT(DISTINCT os.opportunity_id) AS required_by_jobs,
        COUNT(DISTINCT ss.student_id) AS possessed_by_students
      FROM skills sk
      LEFT JOIN opportunity_skills os ON sk.id = os.skill_id
      LEFT JOIN student_skills ss ON sk.id = ss.skill_id
      GROUP BY sk.id, sk.name, sk.category
      ORDER BY required_by_jobs DESC, possessed_by_students DESC
      LIMIT 8
    `);

    // 4. Company Recruitment Leaderboard
    const companyHiring = await db.query(`
      SELECT 
        c.name AS company_name,
        c.logo_url,
        COUNT(DISTINCT o.id) AS postings_count,
        COUNT(DISTINCT a.id) AS total_applicants,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN a.id END) AS selections_count
      FROM companies c
      LEFT JOIN opportunities o ON c.id = o.company_id
      LEFT JOIN applications a ON o.id = a.opportunity_id
      GROUP BY c.id, c.name, c.logo_url
      ORDER BY selections_count DESC, total_applicants DESC
    `);

    return res.status(200).json({
      success: true,
      analytics: {
        departmentStats,
        statusDistribution,
        topSkills,
        companyHiring
      }
    });
  } catch (err) {
    console.error('[Admin Analytics Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve analytics data.' });
  }
}

// 3. GET PENDING OPPORTUNITY APPROVALS
async function getPendingOpportunities(req, res) {
  try {
    const pending = await db.query(`
      SELECT 
        o.*,
        c.name AS company_name,
        c.logo_url AS company_logo,
        r.full_name AS recruiter_name,
        u.email AS recruiter_email
      FROM opportunities o
      INNER JOIN companies c ON o.company_id = c.id
      INNER JOIN recruiters r ON o.recruiter_id = r.id
      INNER JOIN users u ON r.user_id = u.id
      WHERE o.status = 'pending_approval'
      ORDER BY o.created_at DESC
    `);

    return res.status(200).json({ success: true, count: pending.length, pending });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch pending opportunities.' });
  }
}

// 4. APPROVE OR REJECT OPPORTUNITY
async function updateOpportunityApproval(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status.' });
    }

    await db.query(
      'UPDATE opportunities SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    return res.status(200).json({
      success: true,
      message: `Opportunity status has been successfully updated to "${status}".`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update opportunity approval.' });
  }
}

// 5. GET ALL STUDENTS (Management Table)
async function getAllStudents(req, res) {
  try {
    const { search = '', department = '', status = '' } = req.query;

    let sql = `
      SELECT 
        s.id,
        s.user_id,
        s.full_name,
        s.roll_number,
        s.phone,
        s.department,
        s.cgpa,
        s.graduation_year,
        s.resume_url,
        u.email,
        u.status AS account_status,
        COUNT(DISTINCT a.id) AS total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN a.id END) AS offers_received
      FROM students s
      INNER JOIN users u ON s.user_id = u.id
      LEFT JOIN applications a ON s.id = a.student_id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      sql += ' AND (s.full_name LIKE ? OR s.roll_number LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (department) {
      sql += ' AND s.department = ?';
      params.push(department);
    }

    if (status) {
      sql += ' AND u.status = ?';
      params.push(status);
    }

    sql += ' GROUP BY s.id, u.id ORDER BY s.cgpa DESC';

    const students = await db.query(sql, params);

    return res.status(200).json({ success: true, count: students.length, students });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch students list.' });
  }
}

// 6. TOGGLE STUDENT ACCOUNT STATUS (Active/Suspended)
async function updateStudentStatus(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'active' | 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);

    return res.status(200).json({
      success: true,
      message: `Student account status changed to "${status}".`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update student status.' });
  }
}

// 7. GET ALL RECRUITERS (Management Table)
async function getAllRecruiters(req, res) {
  try {
    const recruiters = await db.query(`
      SELECT 
        r.id,
        r.user_id,
        r.company_id,
        r.full_name,
        r.phone,
        r.designation,
        u.email,
        u.status AS account_status,
        c.name AS company_name,
        c.industry,
        c.location AS company_location,
        c.logo_url,
        COUNT(DISTINCT o.id) AS postings_count
      FROM recruiters r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN companies c ON r.company_id = c.id
      LEFT JOIN opportunities o ON r.id = o.recruiter_id
      GROUP BY r.id, u.id, c.id
      ORDER BY r.created_at DESC
    `);

    return res.status(200).json({ success: true, count: recruiters.length, recruiters });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch recruiters.' });
  }
}

// 8. TOGGLE RECRUITER STATUS
async function updateRecruiterStatus(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);

    return res.status(200).json({
      success: true,
      message: `Recruiter account status changed to "${status}".`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update recruiter status.' });
  }
}

// 9. GET ALL APPLICATIONS (Global Monitoring)
async function getAllApplications(req, res) {
  try {
    const { status = '', search = '' } = req.query;

    let sql = `
      SELECT 
        a.id AS application_id,
        a.status,
        a.match_score,
        a.applied_at,
        a.resume_url,
        s.full_name AS student_name,
        s.roll_number,
        s.department,
        s.cgpa,
        o.title AS opportunity_title,
        o.type AS opportunity_type,
        o.salary_or_stipend,
        c.name AS company_name
      FROM applications a
      INNER JOIN students s ON a.student_id = s.id
      INNER JOIN opportunities o ON a.opportunity_id = o.id
      INNER JOIN companies c ON o.company_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'All') {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (s.full_name LIKE ? OR s.roll_number LIKE ? OR o.title LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY a.applied_at DESC';

    const applications = await db.query(sql, params);

    return res.status(200).json({ success: true, count: applications.length, applications });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch global applications.' });
  }
}

// 10. RUN PRE-DEFINED DBMS SHOWCASE QUERIES
async function executeShowcaseQuery(req, res) {
  try {
    const { queryKey } = req.params;

    let title = '';
    let description = '';
    let sql = '';

    switch (queryKey) {
      case 'inner-join':
        title = 'INNER JOIN Demonstration';
        description = 'Active Job Opportunities with Associated Company & Recruiter Profile';
        sql = `
          SELECT o.id, o.title, o.type, c.name AS company, r.full_name AS recruiter, o.salary_or_stipend, o.deadline
          FROM opportunities o
          INNER JOIN companies c ON o.company_id = c.id
          INNER JOIN recruiters r ON o.recruiter_id = r.id
          WHERE o.status = 'approved'
          LIMIT 10
        `;
        break;

      case 'left-join':
        title = 'LEFT JOIN Demonstration';
        description = 'All Registered Students and their Application Counts (including 0)';
        sql = `
          SELECT s.roll_number, s.full_name, s.department, s.cgpa, COUNT(a.id) AS applications_count
          FROM students s
          LEFT JOIN applications a ON s.id = a.student_id
          GROUP BY s.id, s.roll_number, s.full_name, s.department, s.cgpa
          ORDER BY applications_count DESC
          LIMIT 10
        `;
        break;

      case 'group-having':
        title = 'GROUP BY & HAVING Demonstration';
        description = 'Departments having Average CGPA >= 8.5 with Candidate Counts';
        sql = `
          SELECT department, COUNT(id) AS student_count, ROUND(AVG(cgpa), 2) AS average_cgpa, MAX(cgpa) AS top_cgpa
          FROM students
          GROUP BY department
          HAVING AVG(cgpa) >= 8.0
          ORDER BY average_cgpa DESC
        `;
        break;

      case 'subquery':
        title = 'Subquery Demonstration';
        description = 'Students having CGPA strictly above the Campus Average CGPA';
        sql = `
          SELECT roll_number, full_name, department, cgpa
          FROM students
          WHERE cgpa > (SELECT AVG(cgpa) FROM students)
          ORDER BY cgpa DESC
          LIMIT 10
        `;
        break;

      case 'multi-table-join':
        title = '5-Table Complex JOIN Report';
        description = 'Placed Students with Opportunity, Company, and Skill Match Score';
        sql = `
          SELECT a.id, s.full_name AS student, s.department, c.name AS company, o.title AS job, o.salary_or_stipend, a.match_score, a.status
          FROM applications a
          INNER JOIN students s ON a.student_id = s.id
          INNER JOIN opportunities o ON a.opportunity_id = o.id
          INNER JOIN companies c ON o.company_id = c.id
          WHERE a.status = 'Selected'
          ORDER BY s.department
        `;
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid query showcase key.' });
    }

    const results = await db.query(sql);

    return res.status(200).json({
      success: true,
      queryKey,
      title,
      description,
      sql: sql.trim().replace(/\s+/g, ' '),
      rows: results
    });
  } catch (err) {
    console.error('[Showcase Query Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to run showcase query.' });
  }
}

module.exports = {
  getDashboardStats,
  getPlacementAnalytics,
  getPendingOpportunities,
  updateOpportunityApproval,
  getAllStudents,
  updateStudentStatus,
  getAllRecruiters,
  updateRecruiterStatus,
  getAllApplications,
  executeShowcaseQuery
};

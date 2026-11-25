const db = require('../config/db');

// 1. BROWSE OPPORTUNITIES (Jobs & Internships with faceted filters & skill matching)
async function getOpportunities(req, res) {
  try {
    const {
      search = '',
      type = '',          // 'job' | 'internship'
      category = '',
      location = '',
      work_mode = '',     // 'On-site' | 'Remote' | 'Hybrid'
      min_cgpa = '',
      grad_year = '',
      skill_id = '',
      status = 'approved' // default to approved for public/students
    } = req.query;

    let sql = `
      SELECT 
        o.id,
        o.recruiter_id,
        o.company_id,
        o.title,
        o.type,
        o.category,
        o.description,
        o.requirements,
        o.location,
        o.work_mode,
        o.min_cgpa,
        o.allowed_graduation_year,
        o.salary_or_stipend,
        o.openings_count,
        o.deadline,
        o.status,
        o.created_at,
        c.name AS company_name,
        c.logo_url AS company_logo,
        c.website AS company_website,
        c.industry AS company_industry,
        r.full_name AS recruiter_name,
        COUNT(DISTINCT a.id) AS total_applications
      FROM opportunities o
      INNER JOIN companies c ON o.company_id = c.id
      INNER JOIN recruiters r ON o.recruiter_id = r.id
      LEFT JOIN applications a ON o.id = a.opportunity_id
      WHERE 1=1
    `;

    const params = [];

    // Filter by status (approved only for students/public, unless admin/recruiter)
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    if (type) {
      sql += ' AND o.type = ?';
      params.push(type.toLowerCase());
    }

    if (category) {
      sql += ' AND o.category = ?';
      params.push(category);
    }

    if (work_mode) {
      sql += ' AND o.work_mode = ?';
      params.push(work_mode);
    }

    if (location) {
      sql += ' AND o.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (min_cgpa) {
      sql += ' AND o.min_cgpa <= ?';
      params.push(parseFloat(min_cgpa));
    }

    if (grad_year) {
      sql += ' AND (o.allowed_graduation_year = ? OR o.allowed_graduation_year = 0)';
      params.push(parseInt(grad_year, 10));
    }

    if (search) {
      sql += ' AND (o.title LIKE ? OR c.name LIKE ? OR o.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY o.id, c.id, r.id ORDER BY o.created_at DESC';

    const opportunities = await db.query(sql, params);

    // If student is logged in, attach skill match percentage & application status
    let studentSkills = [];
    let studentId = req.user && req.user.student_id ? req.user.student_id : null;
    let appliedOppMap = new Map();

    if (studentId) {
      const skills = await db.query('SELECT skill_id FROM student_skills WHERE student_id = ?', [studentId]);
      studentSkills = new Set(skills.map(s => s.skill_id));

      const existingApps = await db.query('SELECT opportunity_id, status FROM applications WHERE student_id = ?', [studentId]);
      existingApps.forEach(a => appliedOppMap.set(a.opportunity_id, a.status));
    }

    // Attach required skills list and dynamic match score
    const enrichedList = await Promise.all(opportunities.map(async (opp) => {
      const reqSkills = await db.query(
        `SELECT os.skill_id, sk.name, sk.category, os.is_required 
         FROM opportunity_skills os 
         INNER JOIN skills sk ON os.skill_id = sk.id 
         WHERE os.opportunity_id = ?`,
        [opp.id]
      );

      let matchScore = null;
      if (studentId) {
        const totalReq = reqSkills.length;
        if (totalReq === 0) {
          matchScore = 100;
        } else {
          const matched = reqSkills.filter(sk => studentSkills.has(sk.skill_id)).length;
          matchScore = Math.min(100, Math.round((matched / totalReq) * 100));
        }
      }

      return {
        ...opp,
        required_skills: reqSkills,
        matchScore,
        applicationStatus: appliedOppMap.get(opp.id) || null
      };
    }));

    return res.status(200).json({
      success: true,
      count: enrichedList.length,
      opportunities: enrichedList
    });
  } catch (err) {
    console.error('[Get Opportunities Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch opportunities.' });
  }
}

// 2. GET SINGLE OPPORTUNITY DETAILS
async function getOpportunityById(req, res) {
  try {
    const { id } = req.params;

    const opportunities = await db.query(
      `SELECT 
        o.*,
        c.name AS company_name,
        c.logo_url AS company_logo,
        c.website AS company_website,
        c.industry AS company_industry,
        c.description AS company_description,
        c.location AS company_headquarters,
        c.contact_email AS company_email,
        r.full_name AS recruiter_name,
        r.designation AS recruiter_designation,
        COUNT(DISTINCT a.id) AS total_applications
      FROM opportunities o
      INNER JOIN companies c ON o.company_id = c.id
      INNER JOIN recruiters r ON o.recruiter_id = r.id
      LEFT JOIN applications a ON o.id = a.opportunity_id
      WHERE o.id = ?
      GROUP BY o.id, c.id, r.id`,
      [id]
    );

    if (opportunities.length === 0) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const opportunity = opportunities[0];

    // Fetch required skills
    const requiredSkills = await db.query(
      `SELECT os.skill_id, sk.name, sk.category, os.is_required 
       FROM opportunity_skills os 
       INNER JOIN skills sk ON os.skill_id = sk.id 
       WHERE os.opportunity_id = ?`,
      [id]
    );

    opportunity.required_skills = requiredSkills;

    return res.status(200).json({
      success: true,
      opportunity
    });
  } catch (err) {
    console.error('[Get Opportunity By ID Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch opportunity details.' });
  }
}

// 3. CREATE OPPORTUNITY (Recruiter Only)
async function createOpportunity(req, res) {
  try {
    const recruiterId = req.user.recruiter_id;
    const companyId = req.user.company_id;

    if (!recruiterId || !companyId) {
      return res.status(403).json({ success: false, message: 'Recruiter profile not found.' });
    }

    const {
      title,
      type,
      category,
      description,
      requirements,
      location,
      workMode = 'On-site',
      minCgpa = 0.0,
      allowedGraduationYear,
      salaryOrStipend,
      openingsCount = 1,
      deadline,
      skillIds = []
    } = req.body;

    if (!title || !type || !category || !description || !requirements || !location || !salaryOrStipend || !deadline || !allowedGraduationYear) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory opportunity fields.' });
    }

    const oppResult = await db.query(
      `INSERT INTO opportunities (
        recruiter_id, company_id, title, type, category, description, requirements,
        location, work_mode, min_cgpa, allowed_graduation_year, salary_or_stipend,
        openings_count, deadline, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval')`,
      [
        recruiterId,
        companyId,
        title.trim(),
        type.toLowerCase(),
        category,
        description,
        requirements,
        location,
        workMode,
        parseFloat(minCgpa) || 0.0,
        parseInt(allowedGraduationYear, 10),
        salaryOrStipend,
        parseInt(openingsCount, 10) || 1,
        deadline
      ]
    );

    const opportunityId = oppResult.insertId;

    // Insert opportunity skills junction records
    if (Array.isArray(skillIds) && skillIds.length > 0) {
      for (const sId of skillIds) {
        try {
          await db.query(
            'INSERT INTO opportunity_skills (opportunity_id, skill_id, is_required) VALUES (?, ?, TRUE)',
            [opportunityId, parseInt(sId, 10)]
          );
        } catch (e) {
          // ignore duplicate
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Opportunity posted successfully and submitted for Admin approval!',
      opportunityId
    });
  } catch (err) {
    console.error('[Create Opportunity Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to create opportunity.' });
  }
}

// 4. UPDATE OPPORTUNITY (Recruiter Only)
async function updateOpportunity(req, res) {
  try {
    const { id } = req.params;
    const recruiterId = req.user.recruiter_id;

    // Check ownership
    const opps = await db.query('SELECT recruiter_id FROM opportunities WHERE id = ?', [id]);
    if (opps.length === 0) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    if (opps[0].recruiter_id !== recruiterId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit opportunities posted by yourself.' });
    }

    const {
      title,
      type,
      category,
      description,
      requirements,
      location,
      workMode,
      minCgpa,
      allowedGraduationYear,
      salaryOrStipend,
      openingsCount,
      deadline,
      status
    } = req.body;

    await db.query(
      `UPDATE opportunities 
       SET title = ?, type = ?, category = ?, description = ?, requirements = ?,
           location = ?, work_mode = ?, min_cgpa = ?, allowed_graduation_year = ?,
           salary_or_stipend = ?, openings_count = ?, deadline = ?, status = COALESCE(?, status), updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        type,
        category,
        description,
        requirements,
        location,
        workMode,
        parseFloat(minCgpa),
        parseInt(allowedGraduationYear, 10),
        salaryOrStipend,
        parseInt(openingsCount, 10),
        deadline,
        status,
        id
      ]
    );

    return res.status(200).json({ success: true, message: 'Opportunity updated successfully!' });
  } catch (err) {
    console.error('[Update Opportunity Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update opportunity.' });
  }
}

// 5. DELETE OPPORTUNITY (Recruiter or Admin)
async function deleteOpportunity(req, res) {
  try {
    const { id } = req.params;
    const recruiterId = req.user.recruiter_id;

    const opps = await db.query('SELECT recruiter_id FROM opportunities WHERE id = ?', [id]);
    if (opps.length === 0) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    if (opps[0].recruiter_id !== recruiterId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this opportunity.' });
    }

    await db.query('DELETE FROM opportunities WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Opportunity deleted successfully!' });
  } catch (err) {
    console.error('[Delete Opportunity Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete opportunity.' });
  }
}

// 6. GET OPPORTUNITIES POSTED BY LOGGED-IN RECRUITER
async function getRecruiterOpportunities(req, res) {
  try {
    const recruiterId = req.user.recruiter_id;

    const postings = await db.query(
      `SELECT 
        o.*,
        c.name AS company_name,
        c.logo_url AS company_logo,
        COUNT(DISTINCT a.id) AS total_applicants,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN a.id END) AS selected_count,
        COUNT(DISTINCT CASE WHEN a.status = 'Shortlisted' THEN a.id END) AS shortlisted_count,
        COUNT(DISTINCT CASE WHEN a.status = 'Interview' THEN a.id END) AS interview_count
      FROM opportunities o
      INNER JOIN companies c ON o.company_id = c.id
      LEFT JOIN applications a ON o.id = a.opportunity_id
      WHERE o.recruiter_id = ?
      GROUP BY o.id, c.id
      ORDER BY o.created_at DESC`,
      [recruiterId]
    );

    return res.status(200).json({
      success: true,
      postings
    });
  } catch (err) {
    console.error('[Recruiter Postings Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch recruiter postings.' });
  }
}

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getRecruiterOpportunities
};

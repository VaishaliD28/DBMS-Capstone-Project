const db = require('../config/db');

// 1. GET RECRUITER & COMPANY PROFILE
async function getProfile(req, res) {
  try {
    const recruiterId = req.user.recruiter_id;
    const companyId = req.user.company_id;

    const recruiters = await db.query(
      `SELECT r.*, u.email 
       FROM recruiters r 
       INNER JOIN users u ON r.user_id = u.id 
       WHERE r.id = ?`,
      [recruiterId]
    );

    if (recruiters.length === 0) {
      return res.status(404).json({ success: false, message: 'Recruiter profile not found.' });
    }

    const companies = await db.query('SELECT * FROM companies WHERE id = ?', [companyId]);

    // Recruiter posting summary
    const stats = await db.query(
      `SELECT 
        COUNT(DISTINCT o.id) AS total_jobs_posted,
        COUNT(DISTINCT a.id) AS total_applicants_received,
        COUNT(DISTINCT CASE WHEN a.status = 'Shortlisted' THEN a.id END) AS shortlisted_count,
        COUNT(DISTINCT CASE WHEN a.status = 'Interview' THEN a.id END) AS interview_count,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN a.id END) AS offers_made
       FROM opportunities o
       LEFT JOIN applications a ON o.id = a.opportunity_id
       WHERE o.recruiter_id = ?`,
      [recruiterId]
    );

    return res.status(200).json({
      success: true,
      recruiter: recruiters[0],
      company: companies.length > 0 ? companies[0] : null,
      stats: stats[0] || { total_jobs_posted: 0, total_applicants_received: 0, shortlisted_count: 0, interview_count: 0, offers_made: 0 }
    });
  } catch (err) {
    console.error('[Get Recruiter Profile Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch recruiter profile.' });
  }
}

// 2. UPDATE COMPANY PROFILE
async function updateCompanyProfile(req, res) {
  try {
    const companyId = req.user.company_id;
    const { name, website, industry, description, location, logoUrl, contactEmail } = req.body;

    await db.query(
      `UPDATE companies 
       SET name = ?, website = ?, industry = ?, description = ?, location = ?, logo_url = ?, contact_email = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, website, industry, description, location, logoUrl, contactEmail, companyId]
    );

    return res.status(200).json({
      success: true,
      message: 'Company profile updated successfully!'
    });
  } catch (err) {
    console.error('[Update Company Profile Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update company profile.' });
  }
}

// 3. UPDATE RECRUITER PERSONAL PROFILE
async function updateRecruiterProfile(req, res) {
  try {
    const recruiterId = req.user.recruiter_id;
    const { fullName, phone, designation } = req.body;

    await db.query(
      `UPDATE recruiters 
       SET full_name = ?, phone = ?, designation = ?, updated_at = NOW() 
       WHERE id = ?`,
      [fullName, phone, designation, recruiterId]
    );

    return res.status(200).json({
      success: true,
      message: 'Recruiter personal profile updated successfully!'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update recruiter profile.' });
  }
}

module.exports = {
  getProfile,
  updateCompanyProfile,
  updateRecruiterProfile
};

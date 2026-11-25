// Intelligent relational query evaluator for in-memory fallback
function executeFallbackQuery(sql, params, store) {
  const normalized = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT Users by Email
  if (normalized.includes('FROM users WHERE email = ?')) {
    const email = params[0];
    return store.users.filter(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // 2. SELECT User by ID
  if (normalized.includes('FROM users WHERE id = ?')) {
    const id = parseInt(params[0], 10);
    return store.users.filter(u => u.id === id);
  }

  // 3. SELECT Student by User ID
  if (normalized.includes('FROM students WHERE user_id = ?')) {
    const userId = parseInt(params[0], 10);
    return store.students.filter(s => s.user_id === userId);
  }

  // 4. SELECT Student by ID
  if (normalized.includes('FROM students WHERE id = ?')) {
    const id = parseInt(params[0], 10);
    return store.students.filter(s => s.id === id);
  }

  // 5. SELECT Recruiter by User ID
  if (normalized.includes('FROM recruiters WHERE user_id = ?')) {
    const userId = parseInt(params[0], 10);
    const recs = store.recruiters.filter(r => r.user_id === userId);
    return recs.map(r => {
      const comp = store.companies.find(c => c.id === r.company_id) || {};
      return { ...r, company_name: comp.name, company_logo: comp.logo_url };
    });
  }

  // 6. SELECT Recruiter by ID
  if (normalized.includes('FROM recruiters WHERE id = ?')) {
    const id = parseInt(params[0], 10);
    return store.recruiters.filter(r => r.id === id);
  }

  // 7. SELECT Company by ID
  if (normalized.includes('FROM companies WHERE id = ?')) {
    const id = parseInt(params[0], 10);
    return store.companies.filter(c => c.id === id);
  }

  // 8. SELECT All Skills
  if (normalized.includes('FROM skills')) {
    return store.skills;
  }

  // 9. SELECT Student Skills
  if (normalized.includes('FROM student_skills ss') || normalized.includes('FROM student_skills WHERE student_id = ?')) {
    const studentId = parseInt(params[0], 10);
    const mappings = store.student_skills.filter(ss => ss.student_id === studentId);
    return mappings.map(m => {
      const skill = store.skills.find(s => s.id === m.skill_id) || {};
      return {
        id: m.id || m.skill_id,
        skill_id: m.skill_id,
        name: skill.name,
        category: skill.category,
        proficiency: m.proficiency
      };
    });
  }

  // 10. SELECT Opportunities (List & Browse with filters)
  if (normalized.includes('FROM opportunities o') || normalized.includes('vw_active_opportunities_with_companies')) {
    let list = store.opportunities.map(o => {
      const comp = store.companies.find(c => c.id === o.company_id) || {};
      const rec = store.recruiters.find(r => r.id === o.recruiter_id) || {};
      const appCount = store.applications.filter(a => a.opportunity_id === o.id).length;
      
      const reqSkills = store.opportunity_skills
        .filter(os => os.opportunity_id === o.id)
        .map(os => {
          const sk = store.skills.find(s => s.id === os.skill_id) || {};
          return { skill_id: os.skill_id, name: sk.name, is_required: os.is_required };
        });

      return {
        ...o,
        company_name: comp.name,
        company_logo: comp.logo_url,
        company_website: comp.website,
        company_industry: comp.industry,
        recruiter_name: rec.full_name,
        total_applications: appCount,
        required_skills: reqSkills
      };
    });

    if (normalized.includes('WHERE o.id = ?') || normalized.includes('WHERE id = ?')) {
      const oppId = parseInt(params[0], 10);
      return list.filter(o => o.id === oppId);
    }

    if (normalized.includes('WHERE o.recruiter_id = ?')) {
      const recId = parseInt(params[0], 10);
      return list.filter(o => o.recruiter_id === recId);
    }

    return list;
  }

  // 11. SELECT Opportunity Skills
  if (normalized.includes('FROM opportunity_skills')) {
    const oppId = parseInt(params[0], 10);
    const mappings = store.opportunity_skills.filter(os => os.opportunity_id === oppId);
    return mappings.map(os => {
      const sk = store.skills.find(s => s.id === os.skill_id) || {};
      return {
        skill_id: os.skill_id,
        skill_name: sk.name,
        name: sk.name,
        category: sk.category,
        is_required: os.is_required
      };
    });
  }

  // 12. SELECT Applications
  if (normalized.includes('FROM applications a') || normalized.includes('vw_student_application_details')) {
    let list = store.applications.map(a => {
      const opp = store.opportunities.find(o => o.id === a.opportunity_id) || {};
      const comp = store.companies.find(c => c.id === opp.company_id) || {};
      const stud = store.students.find(s => s.id === a.student_id) || {};
      const u = store.users.find(usr => usr.id === stud.user_id) || {};

      return {
        ...a,
        opportunity_title: opp.title,
        opportunity_type: opp.type,
        salary_or_stipend: opp.salary_or_stipend,
        opportunity_location: opp.location,
        work_mode: opp.work_mode,
        deadline: opp.deadline,
        company_id: comp.id,
        company_name: comp.name,
        company_logo: comp.logo_url,
        student_name: stud.full_name,
        roll_number: stud.roll_number,
        department: stud.department,
        cgpa: stud.cgpa,
        graduation_year: stud.graduation_year,
        student_email: u.email
      };
    });

    if (normalized.includes('WHERE a.student_id = ?')) {
      const studId = parseInt(params[0], 10);
      return list.filter(item => item.student_id === studId);
    }

    if (normalized.includes('WHERE a.opportunity_id = ?')) {
      const oppId = parseInt(params[0], 10);
      return list.filter(item => item.opportunity_id === oppId);
    }

    if (normalized.includes('WHERE a.id = ?')) {
      const appId = parseInt(params[0], 10);
      return list.filter(item => item.id === appId);
    }

    return list;
  }

  // 13. Application Status History
  if (normalized.includes('FROM application_status_history')) {
    const appId = parseInt(params[0], 10);
    const hist = store.application_status_history.filter(h => h.application_id === appId);
    return hist.map(h => {
      const u = store.users.find(usr => usr.id === h.changed_by_user_id);
      return { ...h, changed_by_name: u ? u.email : 'System' };
    }).sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at));
  }

  // 14. Notifications
  if (normalized.includes('FROM notifications WHERE user_id = ?')) {
    const userId = parseInt(params[0], 10);
    return store.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // 15. Count queries
  if (normalized.includes('SELECT COUNT(*) AS total FROM students')) {
    return [{ total: store.students.length }];
  }
  if (normalized.includes('SELECT COUNT(*) AS total FROM companies')) {
    return [{ total: store.companies.length }];
  }
  if (normalized.includes('FROM opportunities WHERE status = \'approved\'')) {
    return [{ total: store.opportunities.filter(o => o.status === 'approved').length }];
  }
  if (normalized.includes('FROM opportunities WHERE status = \'pending_approval\'')) {
    return [{ total: store.opportunities.filter(o => o.status === 'pending_approval').length }];
  }
  if (normalized.includes('SELECT COUNT(*) AS total FROM applications')) {
    return [{ total: store.applications.length }];
  }
  if (normalized.includes('FROM applications WHERE status = \'Selected\'')) {
    const placed = new Set(store.applications.filter(a => a.status === 'Selected').map(a => a.student_id)).size;
    return [{ total: placed }];
  }
  if (normalized.includes('SELECT ROUND(AVG(cgpa), 2) AS avg_cgpa FROM students')) {
    const avg = (store.students.reduce((acc, s) => acc + s.cgpa, 0) / (store.students.length || 1)).toFixed(2);
    return [{ avg_cgpa: avg }];
  }

  // Admin Dashboard Stats
  if (normalized.includes('sp_get_admin_dashboard_stats')) {
    const totalStudents = store.students.length;
    const totalCompanies = store.companies.length;
    const totalActiveOpp = store.opportunities.filter(o => o.status === 'approved').length;
    const totalPendingOpp = store.opportunities.filter(o => o.status === 'pending_approval').length;
    const totalApps = store.applications.length;
    const placedStudents = new Set(store.applications.filter(a => a.status === 'Selected').map(a => a.student_id)).size;
    const avgCgpa = (store.students.reduce((acc, s) => acc + s.cgpa, 0) / (totalStudents || 1)).toFixed(2);

    return [{
      total_students: totalStudents,
      total_companies: totalCompanies,
      total_active_opportunities: totalActiveOpp,
      total_pending_approvals: totalPendingOpp,
      total_applications: totalApps,
      total_placed_students: placedStudents,
      campus_average_cgpa: avgCgpa,
      placement_rate: ((placedStudents * 100) / (totalStudents || 1)).toFixed(1)
    }];
  }

  // 16. Placement Analytics View
  if (normalized.includes('vw_placement_analytics') || normalized.includes('GROUP BY s.department')) {
    const depts = [...new Set(store.students.map(s => s.department))];
    return depts.map(dept => {
      const deptStudents = store.students.filter(s => s.department === dept);
      const placed = new Set(
        store.applications
          .filter(a => a.status === 'Selected' && deptStudents.some(s => s.id === a.student_id))
          .map(a => a.student_id)
      ).size;
      const avgCgpa = (deptStudents.reduce((acc, s) => acc + s.cgpa, 0) / deptStudents.length).toFixed(2);
      return {
        department: dept,
        total_students: deptStudents.length,
        placed_students: placed,
        placement_percentage: ((placed * 100) / deptStudents.length).toFixed(1),
        average_cgpa: avgCgpa
      };
    });
  }

  // 17. Application Status Counts
  if (normalized.includes('GROUP BY status') && normalized.includes('applications')) {
    const statuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
    return statuses.map(st => ({
      status: st,
      count: store.applications.filter(a => a.status === st).length
    }));
  }

  // 18. INSERT user
  if (normalized.startsWith('INSERT INTO users')) {
    const newId = store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
    store.users.push({
      id: newId,
      email: params[0],
      password_hash: params[1],
      role: params[2],
      status: 'active',
      created_at: new Date()
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // 19. INSERT student
  if (normalized.startsWith('INSERT INTO students')) {
    const newId = store.students.length ? Math.max(...store.students.map(s => s.id)) + 1 : 1;
    store.students.push({
      id: newId,
      user_id: params[0],
      full_name: params[1],
      roll_number: params[2],
      phone: params[3],
      department: params[4],
      cgpa: parseFloat(params[5]),
      graduation_year: parseInt(params[6], 10),
      bio: params[7] || '',
      resume_url: params[8] || '/uploads/sample-resume.pdf',
      profile_picture: ''
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // 20. INSERT recruiter
  if (normalized.startsWith('INSERT INTO recruiters')) {
    const newId = store.recruiters.length ? Math.max(...store.recruiters.map(r => r.id)) + 1 : 1;
    store.recruiters.push({
      id: newId,
      user_id: params[0],
      company_id: params[1],
      full_name: params[2],
      phone: params[3],
      designation: params[4]
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // 21. INSERT company
  if (normalized.startsWith('INSERT INTO companies')) {
    const newId = store.companies.length ? Math.max(...store.companies.map(c => c.id)) + 1 : 1;
    store.companies.push({
      id: newId,
      name: params[0],
      website: params[1],
      industry: params[2],
      description: params[3],
      location: params[4],
      logo_url: params[5] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
      contact_email: params[6]
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // 22. INSERT opportunity
  if (normalized.startsWith('INSERT INTO opportunities')) {
    const newId = store.opportunities.length ? Math.max(...store.opportunities.map(o => o.id)) + 1 : 1;
    store.opportunities.push({
      id: newId,
      recruiter_id: params[0],
      company_id: params[1],
      title: params[2],
      type: params[3],
      category: params[4],
      description: params[5],
      requirements: params[6],
      location: params[7],
      work_mode: params[8],
      min_cgpa: parseFloat(params[9]),
      allowed_graduation_year: parseInt(params[10], 10),
      salary_or_stipend: params[11],
      openings_count: parseInt(params[12], 10) || 1,
      deadline: params[13],
      status: 'pending_approval',
      created_at: new Date()
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // 23. INSERT application
  if (normalized.startsWith('INSERT INTO applications')) {
    const newId = store.applications.length ? Math.max(...store.applications.map(a => a.id)) + 1 : 1;
    store.applications.push({
      id: newId,
      opportunity_id: params[0],
      student_id: params[1],
      status: 'Applied',
      cover_letter: params[2],
      resume_url: params[3],
      match_score: params[4] || 80,
      applied_at: new Date(),
      updated_at: new Date()
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // 24. UPDATE application status
  if (normalized.startsWith('UPDATE applications SET status = ?')) {
    const newStatus = params[0];
    const appId = parseInt(params[1], 10);
    const app = store.applications.find(a => a.id === appId);
    if (app) {
      app.status = newStatus;
      app.updated_at = new Date();
    }
    return { affectedRows: app ? 1 : 0 };
  }

  // 25. UPDATE student
  if (normalized.startsWith('UPDATE students SET')) {
    const studId = parseInt(params[params.length - 1], 10);
    const stud = store.students.find(s => s.id === studId);
    if (stud) {
      if (params.length >= 6) {
        stud.full_name = params[0];
        stud.phone = params[1];
        stud.department = params[2];
        stud.cgpa = parseFloat(params[3]);
        stud.graduation_year = parseInt(params[4], 10);
        stud.bio = params[5];
      }
    }
    return { affectedRows: stud ? 1 : 0 };
  }

  // 26. UPDATE opportunity status (Admin approve/reject)
  if (normalized.startsWith('UPDATE opportunities SET status = ?')) {
    const newStatus = params[0];
    const oppId = parseInt(params[1], 10);
    const opp = store.opportunities.find(o => o.id === oppId);
    if (opp) opp.status = newStatus;
    return { affectedRows: opp ? 1 : 0 };
  }

  // 27. UPDATE users status
  if (normalized.startsWith('UPDATE users SET status = ?')) {
    const newStatus = params[0];
    const uid = parseInt(params[1], 10);
    const u = store.users.find(usr => usr.id === uid);
    if (u) u.status = newStatus;
    return { affectedRows: u ? 1 : 0 };
  }

  // 28. INSERT notification
  if (normalized.startsWith('INSERT INTO notifications')) {
    const newId = store.notifications.length ? Math.max(...store.notifications.map(n => n.id)) + 1 : 1;
    store.notifications.push({
      id: newId,
      user_id: params[0],
      title: params[1],
      message: params[2],
      type: params[3] || 'application_status',
      reference_id: params[4] || null,
      is_read: 0,
      created_at: new Date()
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // 29. INSERT application_status_history
  if (normalized.startsWith('INSERT INTO application_status_history')) {
    const newId = store.application_status_history.length ? Math.max(...store.application_status_history.map(h => h.id)) + 1 : 1;
    store.application_status_history.push({
      id: newId,
      application_id: params[0],
      status: params[1],
      remarks: params[2],
      changed_by_user_id: params[3] || null,
      changed_at: new Date()
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // Generic fallback
  return [];
}

module.exports = executeFallbackQuery;

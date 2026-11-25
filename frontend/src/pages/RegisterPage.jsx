import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { skillApi, recruiterApi } from '../services/api';
import { Layers, GraduationCap, Building2, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage({ setCurrentPage }) {
  const { registerStudent, registerRecruiter } = useAuth();
  const [roleTab, setRoleTab] = useState('student'); // 'student' | 'recruiter'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillsCatalog, setSkillsCatalog] = useState([]);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    password: '',
    rollNumber: '',
    phone: '',
    department: 'Computer Science and Engineering',
    cgpa: '8.5',
    graduationYear: 2025,
    bio: '',
    selectedSkills: [1, 6, 7, 12] // default JS, React, Node, MySQL
  });

  // Recruiter Form State
  const [recruiterForm, setRecruiterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    designation: 'Campus Hiring Lead',
    companyId: 1,
    newCompanyName: '',
    companyWebsite: '',
    companyIndustry: 'Information Technology',
    companyLocation: 'Bangalore, India'
  });

  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await skillApi.getAll();
        if (res.success && res.skills) {
          setSkillsCatalog(res.skills);
        }
      } catch (e) {}
    }
    loadSkills();
  }, []);

  const handleStudentSkillToggle = (skillId) => {
    setStudentForm(prev => {
      const exists = prev.selectedSkills.includes(skillId);
      return {
        ...prev,
        selectedSkills: exists
          ? prev.selectedSkills.filter(id => id !== skillId)
          : [...prev.selectedSkills, skillId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (roleTab === 'student') {
        await registerStudent({
          fullName: studentForm.fullName,
          email: studentForm.email,
          password: studentForm.password,
          rollNumber: studentForm.rollNumber,
          phone: studentForm.phone,
          department: studentForm.department,
          cgpa: studentForm.cgpa,
          graduationYear: studentForm.graduationYear,
          bio: studentForm.bio,
          skillIds: studentForm.selectedSkills
        });
        setCurrentPage('student-dashboard');
      } else {
        await registerRecruiter({
          fullName: recruiterForm.fullName,
          email: recruiterForm.email,
          password: recruiterForm.password,
          phone: recruiterForm.phone,
          designation: recruiterForm.designation,
          companyId: recruiterForm.companyId,
          newCompanyName: recruiterForm.newCompanyName,
          companyWebsite: recruiterForm.companyWebsite,
          companyIndustry: recruiterForm.companyIndustry,
          companyLocation: recruiterForm.companyLocation
        });
        setCurrentPage('recruiter-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2.5rem 1.5rem' }}>
      <div className="card" style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ margin: '0 auto 0.75rem', width: '44px', height: '44px' }}>
            <Layers size={24} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Create Your Account</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Join the University Job & Internship Placement Portal
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          backgroundColor: '#f1f5f9',
          padding: '0.35rem',
          borderRadius: '0.75rem',
          marginBottom: '1.75rem'
        }}>
          <button
            type="button"
            onClick={() => setRoleTab('student')}
            style={{
              padding: '0.65rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: roleTab === 'student' ? '#ffffff' : 'transparent',
              color: roleTab === 'student' ? '#2563eb' : '#64748b',
              boxShadow: roleTab === 'student' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <GraduationCap size={18} />
            <span>Student Registration</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleTab('recruiter')}
            style={{
              padding: '0.65rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: roleTab === 'recruiter' ? '#ffffff' : 'transparent',
              color: roleTab === 'recruiter' ? '#2563eb' : '#64748b',
              boxShadow: roleTab === 'recruiter' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Building2 size={18} />
            <span>Recruiter Registration</span>
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit}>
          {roleTab === 'student' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Aarav Sharma"
                    value={studentForm.fullName}
                    onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll / University ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 21CSE001"
                    value={studentForm.rollNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">University Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="student@university.edu"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-control"
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                  >
                    <option value="Computer Science and Engineering">CSE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electronics and Communication">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Current CGPA (out of 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="form-control"
                    value={studentForm.cgpa}
                    onChange={(e) => setStudentForm({ ...studentForm, cgpa: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <select
                    className="form-control"
                    value={studentForm.graduationYear}
                    onChange={(e) => setStudentForm({ ...studentForm, graduationYear: parseInt(e.target.value, 10) })}
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>

              {/* Skills Selector */}
              <div className="form-group">
                <label className="form-label">Select Your Technical Skills (Used for Smart Match %)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#f8fafc' }}>
                  {skillsCatalog.map((sk) => {
                    const isSelected = studentForm.selectedSkills.includes(sk.id);
                    return (
                      <button
                        type="button"
                        key={sk.id}
                        onClick={() => handleStudentSkillToggle(sk.id)}
                        style={{
                          fontSize: '0.775rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '9999px',
                          border: `1px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          color: isSelected ? '#1e40af' : '#475569',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected && '✓ '} {sk.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sarah Jenkins"
                    value={recruiterForm.fullName}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Designation</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Lead Campus Recruiter"
                    value={recruiterForm.designation}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, designation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="recruiter@company.com"
                    value={recruiterForm.email}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={recruiterForm.password}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Affiliated Company</label>
                <select
                  className="form-control"
                  value={recruiterForm.companyId}
                  onChange={(e) => setRecruiterForm({ ...recruiterForm, companyId: parseInt(e.target.value, 10) })}
                >
                  <option value={1}>Google India</option>
                  <option value={2}>Microsoft IDC</option>
                  <option value={3}>Amazon Web Services</option>
                  <option value={4}>Deloitte USI</option>
                  <option value={5}>Infosys Technologies</option>
                  <option value={6}>Tata Consultancy Services</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            <UserPlus size={16} />
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          Already have an account?{' '}
          <button
            onClick={() => setCurrentPage('login')}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

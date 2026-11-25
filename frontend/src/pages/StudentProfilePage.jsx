import React, { useState, useEffect } from 'react';
import { studentApi, skillApi } from '../services/api';
import { User, FileText, Upload, Plus, Trash2, Check, AlertCircle, Sparkles, Award } from 'lucide-react';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    department: '',
    cgpa: '',
    graduationYear: 2025,
    bio: ''
  });

  const [newSkillId, setNewSkillId] = useState('');
  const [newSkillProf, setNewSkillProf] = useState('Intermediate');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadProfileAndSkills = async () => {
    try {
      const [profRes, skillsRes] = await Promise.all([
        studentApi.getProfile(),
        skillApi.getAll()
      ]);

      if (profRes.success && profRes.profile) {
        setProfile(profRes.profile);
        setFormData({
          fullName: profRes.profile.full_name || '',
          phone: profRes.profile.phone || '',
          department: profRes.profile.department || '',
          cgpa: profRes.profile.cgpa || '',
          graduationYear: profRes.profile.graduation_year || 2025,
          bio: profRes.profile.bio || ''
        });
      }

      if (skillsRes.success && skillsRes.skills) {
        setSkillsCatalog(skillsRes.skills);
        if (skillsRes.skills.length > 0) {
          setNewSkillId(skillsRes.skills[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfileAndSkills();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await studentApi.updateProfile(formData);
      if (res.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        loadProfileAndSkills();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Only PDF documents are allowed for resume upload.' });
      return;
    }

    const data = new FormData();
    data.append('resume', file);

    setUploadingResume(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await studentApi.uploadResume(data);
      if (res.success) {
        setMessage({ type: 'success', text: 'Resume PDF uploaded successfully!' });
        loadProfileAndSkills();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload resume.' });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillId) return;

    try {
      await studentApi.addSkill({ skillId: newSkillId, proficiency: newSkillProf });
      loadProfileAndSkills();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await studentApi.removeSkill(skillId);
      loadProfileAndSkills();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Profile & Credentials</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Manage your verified academic records, resume attachment, and technical skill proficiencies.
        </p>
      </div>

      {message.text && (
        <div style={{
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#047857' : '#b91c1c',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem'
        }}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Personal and Academic Info Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Academic Details</h2>

          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number (Permanent)</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile?.roll_number || ''}
                  disabled
                  style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-control"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics and Communication">Electronics and Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Current CGPA (0.00 - 10.00)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-control"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <select
                  className="form-control"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value, 10) })}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Summary / Bio</label>
              <textarea
                className="form-control"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                placeholder="Brief summary of your academic interests and career goals..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
              style={{ marginTop: '0.5rem' }}
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Column: Resume & Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Resume Upload Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Resume Document</h3>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={22} style={{ color: '#2563eb' }} />
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', color: '#0f172a' }}>
                    {profile?.full_name}_Resume.pdf
                  </span>
                  <a
                    href={profile?.resume_url || '/uploads/sample-resume.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: '#2563eb' }}
                  >
                    View / Download PDF
                  </a>
                </div>
              </div>
            </div>

            <label className="btn btn-outline" style={{ width: '100%', cursor: 'pointer', justifyContent: 'center' }}>
              <Upload size={16} />
              <span>{uploadingResume ? 'Uploading PDF...' : 'Upload New Resume (PDF)'}</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                style={{ display: 'none' }}
                disabled={uploadingResume}
              />
            </label>
          </div>

          {/* Technical Skills Manager */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={18} style={{ color: '#2563eb' }} />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>My Skills Catalog</h3>
            </div>

            {/* Current Skills List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto', marginBottom: '1.25rem' }}>
              {profile?.skills?.map((sk) => (
                <div
                  key={sk.skill_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.75rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '0.825rem'
                  }}
                >
                  <div>
                    <strong style={{ color: '#0f172a' }}>{sk.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '0.4rem' }}>
                      ({sk.proficiency})
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(sk.skill_id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    title="Remove skill"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <select
                  className="form-control"
                  value={newSkillId}
                  onChange={(e) => setNewSkillId(e.target.value)}
                  style={{ fontSize: '0.825rem' }}
                >
                  {skillsCatalog.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name} ({sk.category})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="form-control"
                  value={newSkillProf}
                  onChange={(e) => setNewSkillProf(e.target.value)}
                  style={{ fontSize: '0.825rem', width: '60%' }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                <button type="submit" className="btn btn-primary btn-sm" style={{ width: '40%' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

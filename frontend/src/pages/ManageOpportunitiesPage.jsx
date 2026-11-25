import React, { useState, useEffect } from 'react';
import { opportunityApi, skillApi } from '../services/api';
import { Plus, Briefcase, Edit, Trash2, Users, X, Check, AlertCircle } from 'lucide-react';

export default function ManageOpportunitiesPage({ setCurrentPage, setSelectedOpportunity }) {
  const [postings, setMyPostings] = useState([]);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form State
  const initialForm = {
    title: '',
    type: 'job',
    category: 'Software Development',
    description: '',
    requirements: '',
    location: 'Bangalore, Karnataka',
    workMode: 'Hybrid',
    minCgpa: '7.5',
    allowedGraduationYear: 2025,
    salaryOrStipend: '₹ 18,00,000 - ₹ 22,00,000 PA',
    openingsCount: 5,
    deadline: '2026-12-31',
    skillIds: [1, 6, 7, 12]
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchPostings = async () => {
    try {
      const [oppRes, skRes] = await Promise.all([
        opportunityApi.getMyPostings(),
        skillApi.getAll()
      ]);
      if (oppRes.success && oppRes.postings) setMyPostings(oppRes.postings);
      if (skRes.success && skRes.skills) setSkillsCatalog(skRes.skills);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  const handleSkillToggle = (skillId) => {
    setFormData(prev => {
      const exists = prev.skillIds.includes(skillId);
      return {
        ...prev,
        skillIds: exists ? prev.skillIds.filter(id => id !== skillId) : [...prev.skillIds, skillId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      if (editingOpp) {
        await opportunityApi.update(editingOpp.id, formData);
        setMessage({ type: 'success', text: 'Opportunity posting updated successfully!' });
      } else {
        await opportunityApi.create(formData);
        setMessage({ type: 'success', text: 'New opportunity submitted for Admin approval!' });
      }
      setShowCreateModal(false);
      setEditingOpp(null);
      setFormData(initialForm);
      fetchPostings();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save opportunity.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity? All associated applications will also be removed.')) return;
    try {
      await opportunityApi.delete(id);
      fetchPostings();
      setMessage({ type: 'success', text: 'Opportunity deleted successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to delete.' });
    }
  };

  const openEditModal = (opp) => {
    setEditingOpp(opp);
    setFormData({
      title: opp.title,
      type: opp.type,
      category: opp.category,
      description: opp.description,
      requirements: opp.requirements,
      location: opp.location,
      workMode: opp.work_mode,
      minCgpa: opp.min_cgpa,
      allowedGraduationYear: opp.allowed_graduation_year,
      salaryOrStipend: opp.salary_or_stipend,
      openingsCount: opp.openings_count,
      deadline: opp.deadline ? opp.deadline.split('T')[0] : '2026-12-31',
      skillIds: []
    });
    setShowCreateModal(true);
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Opportunities</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Create and edit job and internship postings, define eligibility criteria, and evaluate candidate applications.
          </p>
        </div>

        <button
          onClick={() => { setEditingOpp(null); setFormData(initialForm); setShowCreateModal(true); }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Post New Opportunity
        </button>
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

      {/* Postings Table */}
      <div className="card">
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading postings...</p>
        ) : postings.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Briefcase size={36} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
            <p>No job postings found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job / Internship</th>
                  <th>Location & Mode</th>
                  <th>Salary / Stipend</th>
                  <th>Min CGPA</th>
                  <th>Batch</th>
                  <th>Applicants</th>
                  <th>Approval Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {postings.map((opp) => (
                  <tr key={opp.id}>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{opp.title}</strong>
                      <span className={`badge badge-${opp.type === 'job' ? 'applied' : 'shortlisted'}`} style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                        {opp.type.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: '#334155' }}>{opp.location}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>({opp.work_mode})</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.85rem', color: '#059669' }}>{opp.salary_or_stipend}</strong>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{opp.min_cgpa}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>{opp.allowed_graduation_year || 'Any'}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => { setSelectedOpportunity(opp); setCurrentPage('manage-applicants'); }}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.6rem' }}
                      >
                        <Users size={14} /> {opp.total_applicants || 0}
                      </button>
                    </td>
                    <td>
                      <span className={`badge badge-${opp.status === 'approved' ? 'approved' : 'pending'}`}>
                        {opp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(opp)}
                          className="icon-btn"
                          title="Edit posting"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(opp.id)}
                          className="icon-btn"
                          title="Delete posting"
                          style={{ width: '32px', height: '32px', color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Opportunity Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingOpp ? 'Edit Opportunity Posting' : 'Post New Job or Internship'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Position Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Software Development Engineer - Cloud"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Opportunity Type</label>
                  <select
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="job">Full-time Job</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Mode</label>
                  <select
                    className="form-control"
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Min CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="form-control"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Allowed Batch</label>
                  <select
                    className="form-control"
                    value={formData.allowedGraduationYear}
                    onChange={(e) => setFormData({ ...formData, allowedGraduationYear: parseInt(e.target.value, 10) })}
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Salary / Stipend</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. ₹ 25,00,000 PA"
                    value={formData.salaryOrStipend}
                    onChange={(e) => setFormData({ ...formData, salaryOrStipend: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Job Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requirements & Responsibilities</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  required
                />
              </div>

              {/* Skills Tagging */}
              <div className="form-group">
                <label className="form-label">Required Skills (Mapped for Candidate Skill Matching)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '120px', overflowY: 'auto', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#f8fafc' }}>
                  {skillsCatalog.map((sk) => {
                    const isSelected = formData.skillIds.includes(sk.id);
                    return (
                      <button
                        type="button"
                        key={sk.id}
                        onClick={() => handleSkillToggle(sk.id)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingOpp ? 'Update Posting' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

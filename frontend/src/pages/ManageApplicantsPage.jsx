import React, { useState, useEffect } from 'react';
import { applicationApi, opportunityApi } from '../services/api';
import StatusUpdateModal from '../components/StatusUpdateModal';
import { Users, FileText, CheckCircle2, Sparkles, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';

export default function ManageApplicantsPage({ selectedOpportunity, setSelectedOpportunity }) {
  const [postings, setPostings] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState(selectedOpportunity?.id || '');
  const [applicants, setApplicants] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('match');
  const [loading, setLoading] = useState(true);
  const [updatingApplicant, setUpdatingApplicant] = useState(null);
  const [message, setMessage] = useState('');

  // 1. Fetch Recruiter Postings
  useEffect(() => {
    async function loadPostings() {
      try {
        const res = await opportunityApi.getMyPostings();
        if (res.success && res.postings) {
          setPostings(res.postings);
          if (!selectedOppId && res.postings.length > 0) {
            setSelectedOppId(res.postings[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadPostings();
  }, []);

  // 2. Fetch Applicants for Selected Opportunity
  const fetchApplicants = async () => {
    if (!selectedOppId) return;
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (sortBy) params.sortBy = sortBy;

      const res = await applicationApi.getOpportunityApplicants(selectedOppId, params);
      if (res.success && res.applicants) {
        setApplicants(res.applicants);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [selectedOppId, statusFilter, sortBy]);

  const handleStatusUpdateSuccess = () => {
    setMessage('Candidate status updated successfully!');
    fetchApplicants();
    setTimeout(() => setMessage(''), 4000);
  };

  const currentOpp = postings.find(p => p.id === parseInt(selectedOppId, 10));

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Applicants & Candidate Review</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Screen candidates with Smart Skill Matching, inspect student academic profiles and resumes, and manage hiring stages.
        </p>
      </div>

      {message && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {message}
        </div>
      )}

      {/* Filter and Job Selection Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
          {/* Opportunity Dropdown */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Opportunity Posting</label>
            <select
              className="form-control"
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
            >
              {postings.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.total_applicants || 0} applicants)
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Status</label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Sort Candidates</label>
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="match">Highest Skill Match %</option>
              <option value="cgpa">Highest CGPA</option>
              <option value="date">Most Recent Applied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applicants Table Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              Candidate Pipeline ({applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'})
            </h2>
            <p className="card-desc">
              Posting: <strong>{currentOpp?.title}</strong> • Min CGPA: {currentOpp?.min_cgpa}
            </p>
          </div>
        </div>

        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading applicant records...</p>
        ) : applicants.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Users size={36} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
            <p>No candidates found matching this filter.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Department & Roll</th>
                  <th>CGPA</th>
                  <th>Smart Skill Match</th>
                  <th>Student Skills</th>
                  <th>Current Status</th>
                  <th>Resume</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((cand) => (
                  <tr key={cand.application_id}>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{cand.student_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{cand.student_email}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: '#334155', display: 'block' }}>{cand.department}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{cand.roll_number}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{cand.cgpa}</strong>
                    </td>
                    <td>
                      <div className={`match-score-badge ${cand.match_score >= 80 ? 'match-score-high' : cand.match_score >= 60 ? 'match-score-med' : 'match-score-low'}`}>
                        <Sparkles size={13} />
                        <span>{cand.match_score}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '240px' }}>
                        {cand.skills?.map((sk, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.7rem',
                              backgroundColor: '#f1f5f9',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '0.3rem',
                              color: '#334155'
                            }}
                          >
                            {sk.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${cand.status.toLowerCase().replace(' ', '-')}`}>
                        {cand.status}
                      </span>
                    </td>
                    <td>
                      <a
                        href={cand.resume_url || '/uploads/sample-resume.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.6rem' }}
                      >
                        <FileText size={14} /> View PDF
                      </a>
                    </td>
                    <td>
                      <button
                        onClick={() => setUpdatingApplicant(cand)}
                        className="btn btn-primary btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {updatingApplicant && (
        <StatusUpdateModal
          applicant={updatingApplicant}
          onClose={() => setUpdatingApplicant(null)}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}
    </div>
  );
}

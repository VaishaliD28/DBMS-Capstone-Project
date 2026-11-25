import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Search, FileText, CheckCircle2, Building2 } from 'lucide-react';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;

      const res = await adminApi.getApplications(params);
      if (res.success && res.applications) {
        setApplications(res.applications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [search, statusFilter]);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Global Application Tracker</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Real-time oversight of all student applications submitted across corporate partners.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by student, company, or job title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Application Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading applications...</p>
        ) : applications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <FileText size={36} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
            <p>No applications found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Department & Roll</th>
                  <th>CGPA</th>
                  <th>Opportunity</th>
                  <th>Company</th>
                  <th>Skill Match</th>
                  <th>Current Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.application_id}>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{app.student_name}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#334155', display: 'block' }}>{app.department}</span>
                      <span style={{ fontSize: '0.725rem', color: '#64748b' }}>{app.roll_number}</span>
                    </td>
                    <td>
                      <strong>{app.cgpa}</strong>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{app.opportunity_title}</strong>
                      <span style={{ fontSize: '0.725rem', color: '#059669' }}>{app.salary_or_stipend}</span>
                    </td>
                    <td>{app.company_name}</td>
                    <td>
                      <span className={`match-score-badge ${app.match_score >= 80 ? 'match-score-high' : 'match-score-med'}`}>
                        {app.match_score}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${app.status.toLowerCase().replace(' ', '-')}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

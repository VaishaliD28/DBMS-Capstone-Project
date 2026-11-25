import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Building2, Briefcase, Check, AlertCircle } from 'lucide-react';

export default function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRecruiters();
      if (res.success && res.recruiters) {
        setRecruiters(res.recruiters);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await adminApi.updateRecruiterStatus(userId, newStatus);
      if (res.success) {
        setActionMsg(`Recruiter account status changed to ${newStatus}.`);
        fetchRecruiters();
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Corporate Recruiters</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Registered company representatives and recruitment partners.
        </p>
      </div>

      {actionMsg && (
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
          {actionMsg}
        </div>
      )}

      <div className="card">
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading recruiters...</p>
        ) : recruiters.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Building2 size={36} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
            <p>No recruiters found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Recruiter Name</th>
                  <th>Affiliated Company</th>
                  <th>Designation</th>
                  <th>Contact Email</th>
                  <th>Jobs Posted</th>
                  <th>Account Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recruiters.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{rec.full_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{rec.phone}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {rec.logo_url && (
                          <img
                            src={rec.logo_url}
                            alt=""
                            style={{ width: '28px', height: '28px', borderRadius: '0.35rem', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{rec.company_name}</strong>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>{rec.industry}</span>
                        </div>
                      </div>
                    </td>
                    <td>{rec.designation}</td>
                    <td>{rec.email}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#2563eb' }}>{rec.postings_count || 0}</span>
                    </td>
                    <td>
                      <span className={`badge ${rec.account_status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
                        {rec.account_status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(rec.user_id, rec.account_status)}
                        className={`btn btn-sm ${rec.account_status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        style={{ padding: '0.25rem 0.6rem' }}
                      >
                        {rec.account_status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
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

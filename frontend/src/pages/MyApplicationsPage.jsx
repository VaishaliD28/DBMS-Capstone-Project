import React, { useState, useEffect } from 'react';
import { applicationApi } from '../services/api';
import ApplicationTracker from '../components/ApplicationTracker';
import { FileText, Building2, Calendar, DollarSign, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function MyApplicationsPage({ setCurrentPage, setSelectedOpportunity }) {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.getMyApplications();
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
    fetchApplications();
  }, []);

  const filterTabs = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

  const filtered = statusFilter === 'All'
    ? applications
    : applications.filter(a => a.status === statusFilter);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Applications & Tracking</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Monitor your recruitment stages, interview invitations, and official offers in real time.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab;
          const count = tab === 'All' ? applications.length : applications.filter(a => a.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: '9999px', padding: '0.4rem 0.85rem' }}
            >
              <span>{tab}</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: 700
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          Loading your applications...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
          <FileText size={40} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.5rem' }}>No applications in this category</h3>
          <p style={{ fontSize: '0.875rem' }}>You haven't submitted any applications matching this status.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filtered.map((app) => (
            <div key={app.id} className="card" style={{ padding: '1.75rem' }}>
              {/* Header Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {app.company_logo ? (
                    <img
                      src={app.company_logo}
                      alt={app.company_name}
                      style={{ width: '52px', height: '52px', borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    />
                  ) : (
                    <div style={{ width: '52px', height: '52px', borderRadius: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={26} />
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>{app.company_name}</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{app.opportunity_title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <span>{app.opportunity_location}</span>
                      <span>•</span>
                      <span style={{ fontWeight: 600, color: '#059669' }}>{app.salary_or_stipend}</span>
                      <span>•</span>
                      <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge badge-${app.status.toLowerCase().replace(' ', '-')}`}>
                    {app.status}
                  </span>
                  {app.resume_url && (
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      title="View submitted resume"
                    >
                      <FileText size={14} /> Resume
                    </a>
                  )}
                </div>
              </div>

              {/* Visual Application Tracker */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <ApplicationTracker status={app.status} latestRemark={app.latest_remark} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

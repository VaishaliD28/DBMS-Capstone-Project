import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { recruiterApi, opportunityApi } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Award,
  Building2,
  Plus,
  ExternalLink,
  ChevronRight,
  Clock
} from 'lucide-react';

export default function RecruiterDashboard({ setCurrentPage, setSelectedOpportunity }) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [myPostings, setMyPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecruiterData() {
      try {
        const [profRes, oppsRes] = await Promise.all([
          recruiterApi.getProfile(),
          opportunityApi.getMyPostings()
        ]);

        if (profRes.success) setProfileData(profRes);
        if (oppsRes.success && oppsRes.postings) setMyPostings(oppsRes.postings);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadRecruiterData();
  }, []);

  const stats = profileData?.stats || {
    total_jobs_posted: 0,
    total_applicants_received: 0,
    shortlisted_count: 0,
    offers_made: 0
  };

  const handleReviewApplicants = (opp) => {
    if (setSelectedOpportunity) {
      setSelectedOpportunity(opp);
      setCurrentPage('manage-applicants');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Recruiter & Company Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: '#ffffff',
        padding: '2rem 2.5rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {profileData?.company?.logo_url ? (
            <img
              src={profileData.company.logo_url}
              alt="Company Logo"
              style={{ width: '60px', height: '60px', borderRadius: '0.75rem', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
            />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={32} />
            </div>
          )}
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, fontWeight: 700 }}>
              Corporate Recruitment Partner
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.15rem' }}>
              {profileData?.company?.name || 'Partner Company'}
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.875rem', marginTop: '0.2rem' }}>
              {profileData?.recruiter?.full_name} • {profileData?.recruiter?.designation}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('manage-opportunities')}
          className="btn"
          style={{ backgroundColor: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}
        >
          <Plus size={16} /> Post New Opportunity
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          title="Active Postings"
          value={stats.total_jobs_posted}
          subtitle="Jobs & Internships live"
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Total Applications"
          value={stats.total_applicants_received}
          subtitle="Received across postings"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Shortlisted Candidates"
          value={stats.shortlisted_count}
          subtitle="Cleared initial screening"
          icon={CheckCircle2}
          color="amber"
        />
        <StatCard
          title="Offers Made"
          value={stats.offers_made}
          subtitle="Selected candidates 🎉"
          icon={Award}
          color="green"
        />
      </div>

      {/* Postings Management Table Preview */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">My Posted Opportunities</h2>
            <p className="card-desc">Monitor applicant pipeline and update candidate statuses</p>
          </div>
          <button
            onClick={() => setCurrentPage('manage-opportunities')}
            className="btn btn-outline btn-sm"
          >
            Manage All Postings
          </button>
        </div>

        {myPostings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <p>You haven't posted any jobs or internships yet.</p>
            <button
              onClick={() => setCurrentPage('manage-opportunities')}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.75rem' }}
            >
              Post First Job
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job / Internship Title</th>
                  <th>Type</th>
                  <th>Total Applicants</th>
                  <th>Pipeline Status</th>
                  <th>Posting Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myPostings.map((opp) => (
                  <tr key={opp.id}>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{opp.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{opp.location} • {opp.salary_or_stipend}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${opp.type === 'job' ? 'applied' : 'shortlisted'}`} style={{ textTransform: 'uppercase' }}>
                        {opp.type}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: '#2563eb' }}>{opp.total_applicants}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
                        Shortlisted: <strong>{opp.shortlisted_count || 0}</strong> • Hired: <strong style={{ color: '#059669' }}>{opp.selected_count || 0}</strong>
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${opp.status === 'approved' ? 'approved' : 'pending'}`}>
                        {opp.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleReviewApplicants(opp)}
                        className="btn btn-primary btn-sm"
                      >
                        Review Applicants ({opp.total_applicants})
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

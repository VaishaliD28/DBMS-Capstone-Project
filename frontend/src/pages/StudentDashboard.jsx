import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentApi, opportunityApi, applicationApi } from '../services/api';
import StatCard from '../components/StatCard';
import OpportunityCard from '../components/OpportunityCard';
import ApplicationTracker from '../components/ApplicationTracker';
import {
  FileText,
  CheckCircle2,
  Calendar,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Building2,
  BookOpen
} from 'lucide-react';

export default function StudentDashboard({ setCurrentPage, setSelectedOpportunity }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ total_applied: 0, shortlisted_count: 0, interview_count: 0, offers_count: 0 });
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [profRes, oppsRes, appsRes] = await Promise.all([
          studentApi.getProfile(),
          opportunityApi.getAll({ status: 'approved' }),
          applicationApi.getMyApplications()
        ]);

        if (profRes.success && profRes.profile) {
          setProfile(profRes.profile);
          setStats(profRes.profile.stats || stats);
        }

        if (oppsRes.success && oppsRes.opportunities) {
          // Sort by matchScore descending if available
          const sorted = [...oppsRes.opportunities].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          setRecommendedJobs(sorted.slice(0, 3));
        }

        if (appsRes.success && appsRes.applications) {
          setRecentApplications(appsRes.applications.slice(0, 2));
        }
      } catch (e) {
        console.error('Student dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const handleSelectJob = (opp) => {
    if (setSelectedOpportunity) {
      setSelectedOpportunity(opp);
      setCurrentPage('job-details');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Welcome Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
        color: '#ffffff',
        padding: '2rem 2.5rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, fontWeight: 700 }}>
            Student Placement Portal
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            Welcome, {profile?.full_name || user?.profile?.full_name || 'Student'}! 👋
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.925rem', marginTop: '0.35rem', maxWidth: '600px' }}>
            {profile?.department} • Roll No: {profile?.roll_number} • Current CGPA: <strong>{profile?.cgpa}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setCurrentPage('browse-jobs')}
            className="btn"
            style={{ backgroundColor: '#ffffff', color: '#1e40af', fontWeight: 700 }}
          >
            Explore Jobs <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          title="Applications Sent"
          value={stats.total_applied}
          subtitle="Tracked in real-time"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted_count}
          subtitle="Cleared initial screening"
          icon={CheckCircle2}
          color="purple"
        />
        <StatCard
          title="Interview Calls"
          value={stats.interview_count}
          subtitle="Technical & HR rounds"
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Offers Received"
          value={stats.offers_count}
          subtitle="Placement Confirmed 🎉"
          icon={Award}
          color="green"
        />
      </div>

      {/* Main Grid: Active Applications & Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Recent Applications with Progress Stepper */}
        <div>
          <div className="card-header">
            <div>
              <h2 className="card-title">My Recent Applications</h2>
              <p className="card-desc">Visual progress and recruiter remarks</p>
            </div>
            <button
              onClick={() => setCurrentPage('my-applications')}
              className="btn btn-outline btn-sm"
            >
              View All
            </button>
          </div>

          {recentApplications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
              <FileText size={36} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
              <p style={{ fontWeight: 600 }}>No applications submitted yet.</p>
              <button
                onClick={() => setCurrentPage('browse-jobs')}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '1rem' }}
              >
                Browse Opportunities
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {recentApplications.map((app) => (
                <div key={app.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{app.company_name}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{app.opportunity_title}</h4>
                    </div>
                    <span className={`badge badge-${app.status.toLowerCase().replace(' ', '-')}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Application Tracker Stepper */}
                  <ApplicationTracker status={app.status} latestRemark={app.latest_remark} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Top Recommended Jobs with Match Scores */}
        <div>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: '#2563eb' }} />
              <div>
                <h2 className="card-title">Smart Match Recommendations</h2>
                <p className="card-desc">Ranked by skills compatibility</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('browse-jobs')}
              className="btn btn-outline btn-sm"
            >
              All Jobs
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recommendedJobs.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onSelect={handleSelectJob}
                userRole="student"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, opportunityApi } from '../services/api';
import {
  Briefcase,
  GraduationCap,
  Building2,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Database
} from 'lucide-react';

export default function LandingPage({ setCurrentPage }) {
  const { quickLogin } = useAuth();
  const [stats, setStats] = useState({
    total_students: 16,
    total_companies: 6,
    total_active_opportunities: 11,
    total_applications: 28,
    placement_rate: 62.5
  });
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await adminApi.getStats();
        if (res.success && res.stats) setStats(res.stats);
      } catch (e) {}

      try {
        const jobRes = await opportunityApi.getAll({ status: 'approved' });
        if (jobRes.success && jobRes.opportunities) {
          setFeaturedJobs(jobRes.opportunities.slice(0, 3));
        }
      } catch (e) {}
    }
    fetchStats();
  }, []);

  const handleQuickDemo = async (role) => {
    setLoggingIn(true);
    try {
      await quickLogin(role);
      if (role === 'admin') setCurrentPage('admin-dashboard');
      else if (role === 'recruiter') setCurrentPage('recruiter-dashboard');
      else setCurrentPage('student-dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Top Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2.5rem',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="logo-icon" style={{ width: '38px', height: '38px' }}>
            <Layers size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>CampusPortal</h1>
            <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>
              University DBMS Capstone
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setCurrentPage('browse-jobs')}
            className="btn btn-outline btn-sm"
          >
            <Briefcase size={15} />
            <span>Browse Jobs</span>
          </button>
          <button
            onClick={() => setCurrentPage('login')}
            className="btn btn-primary btn-sm"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '4.5rem 2rem 3.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          border: '1px solid #bfdbfe'
        }}>
          <Database size={15} />
          <span>Relational MySQL Placement & Internship Management System</span>
        </div>

        <h1 style={{
          fontSize: '3.25rem',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          letterSpacing: '-0.03em'
        }}>
          Connecting Campus Talent with <br />
          <span style={{
            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Global Tech Leaders
          </span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: '#475569',
          maxWidth: '750px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          A complete, database-driven university placement system featuring Smart Skill Matching,
          dynamic eligibility enforcement, visual multi-stage application tracking, and rich DBMS placement analytics.
        </p>

        {/* 1-Click Role Login Shortcuts */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '1rem',
          padding: '1.5rem 2rem',
          maxWidth: '850px',
          margin: '0 auto 3.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ⚡ Instant 1-Click Live Demonstration Access
          </span>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {/* Student Login */}
            <button
              onClick={() => handleQuickDemo('student')}
              disabled={loggingIn}
              className="btn"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                borderRadius: '0.75rem',
                textAlign: 'left'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={22} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>Student Role</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Aarav Sharma (9.45 CGPA)</span>
              </div>
            </button>

            {/* Recruiter Login */}
            <button
              onClick={() => handleQuickDemo('recruiter')}
              disabled={loggingIn}
              className="btn"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                borderRadius: '0.75rem',
                textAlign: 'left'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>Recruiter Role</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Google India Recruiter</span>
              </div>
            </button>

            {/* Admin Login */}
            <button
              onClick={() => handleQuickDemo('admin')}
              disabled={loggingIn}
              className="btn"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                borderRadius: '0.75rem',
                textAlign: 'left'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={22} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>Admin Role</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Placement Cell Officer</span>
              </div>
            </button>
          </div>
        </div>

        {/* Live Portal Statistics Counter */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          padding: '2rem',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
        }}>
          <div>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2563eb', fontFamily: 'Plus Jakarta Sans' }}>
              {stats.total_students}+
            </span>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Registered Students
            </span>
          </div>
          <div>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#059669', fontFamily: 'Plus Jakarta Sans' }}>
              {stats.total_companies}
            </span>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Partner Companies
            </span>
          </div>
          <div>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#7c3aed', fontFamily: 'Plus Jakarta Sans' }}>
              {stats.total_active_opportunities}
            </span>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Active Opportunities
            </span>
          </div>
          <div>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#d97706', fontFamily: 'Plus Jakarta Sans' }}>
              {stats.placement_rate}%
            </span>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Placement Rate
            </span>
          </div>
        </div>
      </section>

      {/* Core DBMS Features Section */}
      <section style={{ backgroundColor: '#f8fafc', padding: '4rem 2rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              Capstone Highlights
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              Advanced DBMS Capabilities
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Smart Skill Matching</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Computes real-time match percentages between student technical skills and job requirements using SQL relational set operations.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Automated Eligibility Checking</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Strict constraints check CGPA thresholds, graduation year batches, and application expiration dates before permitting submissions.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Visual Application Tracker</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Interactive 5-stage progress stepper tracking Applied, Under Review, Shortlisted, Interview, and Offer status with audit history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid #e2e8f0',
        color: '#64748b',
        fontSize: '0.85rem'
      }}>
        <p>© 2026 University Placement Cell | DBMS Capstone Project | Normalized MySQL Relational Architecture</p>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Layers, GraduationCap, Building2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage({ setCurrentPage }) {
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.user.role === 'admin') setCurrentPage('admin-dashboard');
      else if (res.user.role === 'recruiter') setCurrentPage('recruiter-dashboard');
      else setCurrentPage('student-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role) => {
    setLoading(true);
    setError('');
    try {
      const res = await quickLogin(role);
      if (role === 'admin') setCurrentPage('admin-dashboard');
      else if (role === 'recruiter') setCurrentPage('recruiter-dashboard');
      else setCurrentPage('student-dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
            <Layers size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            University Placement & Internship Portal
          </p>
        </div>

        {/* 1-Click Demo Login Bar */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.65rem' }}>
            ⚡ 1-Click Quick Demo Sign In:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuick('student')}
              disabled={loading}
              className="btn btn-outline btn-sm"
              style={{ backgroundColor: '#ffffff', fontSize: '0.75rem', padding: '0.4rem 0.2rem' }}
            >
              <GraduationCap size={14} /> Student
            </button>
            <button
              type="button"
              onClick={() => handleQuick('recruiter')}
              disabled={loading}
              className="btn btn-outline btn-sm"
              style={{ backgroundColor: '#ffffff', fontSize: '0.75rem', padding: '0.4rem 0.2rem' }}
            >
              <Building2 size={14} /> Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleQuick('admin')}
              disabled={loading}
              className="btn btn-outline btn-sm"
              style={{ backgroundColor: '#ffffff', fontSize: '0.75rem', padding: '0.4rem 0.2rem' }}
            >
              <ShieldCheck size={14} /> Admin
            </button>
          </div>
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

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. aarav.sharma@student.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          Don't have an account yet?{' '}
          <button
            onClick={() => setCurrentPage('register')}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}
